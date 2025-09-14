"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreService = void 0;
const critera_1 = require("./critera");
class ScoreService {
    constructor() {
        this.SCORING_CRITERIA = critera_1.SCORING_CRITERIA;
    }
    calculateProfileScore(profileData) {
        const sectionScoresMap = new Map();
        let totalScore = 0;
        let maxTotalScore = 0;
        // Calculate scores for each criteria and group by section
        for (const criteria of this.SCORING_CRITERIA) {
            const maxScore = parseInt(criteria.max_score);
            maxTotalScore += maxScore;
            const score = this.calculateSectionScore(profileData, criteria);
            totalScore += score;
            const section = criteria.section;
            const details = this.getScoreDetails(profileData, criteria, score);
            if (sectionScoresMap.has(section)) {
                // Section already exists, add to existing scores and details
                const existing = sectionScoresMap.get(section);
                existing.score += score;
                existing.maxScore += maxScore;
                existing.details.push(...details);
            }
            else {
                // New section, create entry
                sectionScoresMap.set(section, {
                    score: score,
                    maxScore: maxScore,
                    details: details
                });
            }
        }
        // Convert map to array format
        const sectionScores = Array.from(sectionScoresMap.entries()).map(([section, data]) => ({
            section,
            score: data.score,
            maxScore: data.maxScore,
            details: data.details
        }));
        const percentage = Math.round((totalScore / maxTotalScore) * 100);
        const grade = this.calculateGrade(percentage);
        return {
            totalScore,
            maxTotalScore,
            percentage,
            sectionScores,
            grade
        };
    }
    calculateSectionScore(profileData, criteria) {
        const section = criteria.section;
        const criteriaType = criteria.criteria;
        switch (section) {
            case "linkedInUrl":
                return this.scoreLinkedInUrl(profileData, criteria);
            case "country":
                return this.scoreCountry(profileData, criteria);
            case "headline":
                if (criteriaType === "length") {
                    return this.scoreHeadlineLength(profileData, criteria);
                }
                else if (criteriaType === "keywords") {
                    return this.scoreHeadlineKeywords(profileData, criteria);
                }
                break;
            case "summary":
                if (criteriaType === "length") {
                    return this.scoreSummaryLength(profileData, criteria);
                }
                else if (criteriaType === "email") {
                    return this.scoreSummaryEmail(profileData, criteria);
                }
                break;
            case "experiences":
                if (criteriaType === "notEmpty") {
                    return this.scoreExperiencesNotEmpty(profileData, criteria);
                }
                else if (criteriaType === "length") {
                    return this.scoreExperiencesLength(profileData, criteria);
                }
                break;
            case "education":
                return this.scoreEducation(profileData, criteria);
            case "skills":
                return this.scoreSkills(profileData, criteria);
            case "publications":
                return this.scorePublications(profileData, criteria);
            case "languages":
                return this.scoreLanguages(profileData, criteria);
            case "certificates":
                return this.scoreCertificates(profileData, criteria);
            case "honorsAwards":
                return this.scoreHonorsAwards(profileData, criteria);
            case "volunteer":
                return this.scoreVolunteer(profileData, criteria);
            case "patents":
                return this.scorePatents(profileData, criteria);
            case "testScores":
                return this.scoreTestScores(profileData, criteria);
            case "organizations":
                return this.scoreOrganizations(profileData, criteria);
            case "featured":
                return this.scoreFeatured(profileData, criteria);
            case "projects":
                return this.scoreProjects(profileData, criteria);
            case "recommendations":
                return this.scoreRecommendations(profileData, criteria);
            case "causes":
                return this.scoreCauses(profileData, criteria);
            case "contactInfo":
                return this.scoreContactInfo(profileData, criteria);
            default:
                return 0;
        }
        return 0;
    }
    scoreLinkedInUrl(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        if (!profileData.inputUrl)
            return 0;
        // Check if URL is customized (doesn't contain "-" followed by numbers)
        // Customized URLs look like: linkedin.com/in/johndoe
        // Non-customized URLs look like: linkedin.com/in/john-doe-123456789
        const isCustomized = !/-[0-9]+/.test(profileData.inputUrl);
        return isCustomized ? maxScore : 0;
    }
    scoreCountry(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        return (profileData.geoCountryName || profileData.geoLocationName) ? maxScore : 0;
    }
    scoreHeadlineLength(profileData, criteria) {
        var _a;
        const maxScore = parseInt(criteria.max_score);
        const minWords = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 10;
        if (!profileData.headline)
            return 0;
        const wordCount = profileData.headline.trim().split(/\s+/).length;
        return wordCount >= minWords ? maxScore : Math.round((wordCount / minWords) * maxScore);
    }
    scoreHeadlineKeywords(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        if (!profileData.headline)
            return 0;
        const headline = profileData.headline.toLowerCase();
        const keywords = [
            // Professional levels
            'senior', 'junior', 'mid', 'lead', 'principal', 'associate', 'director', 'manager', 'head', 'chief',
            // Professional roles
            'specialist', 'expert', 'consultant', 'advisor', 'coordinator', 'supervisor', 'superintendent',
            // Industry-agnostic skills
            'analyst', 'strategist', 'planner', 'researcher', 'designer', 'developer', 'engineer', 'architect',
            // Business functions
            'marketing', 'sales', 'finance', 'hr', 'operations', 'strategy', 'business', 'commercial',
            // Technical areas (broad)
            'digital', 'data', 'analytics', 'research', 'innovation', 'quality', 'compliance', 'risk',
            // Leadership
            'team', 'project', 'program', 'initiative', 'transformation', 'change', 'growth', 'development'
        ];
        const foundKeywords = keywords.filter(keyword => headline.includes(keyword));
        return Math.min(foundKeywords.length * 2, maxScore);
    }
    scoreSummaryLength(profileData, criteria) {
        var _a;
        const maxScore = parseInt(criteria.max_score);
        const minWords = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 200;
        if (!profileData.summary)
            return 0;
        const wordCount = profileData.summary.trim().split(/\s+/).length;
        return wordCount >= minWords ? maxScore : Math.round((wordCount / minWords) * maxScore);
    }
    scoreSummaryEmail(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        if (!profileData.summary)
            return 0;
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        return emailRegex.test(profileData.summary) ? maxScore : 0;
    }
    scoreExperiencesNotEmpty(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        if (!profileData.positions || !Array.isArray(profileData.positions))
            return 0;
        const hasDescriptions = profileData.positions.some((pos) => pos.description && pos.description.trim().length > 0);
        return hasDescriptions ? maxScore : 0;
    }
    scoreExperiencesLength(profileData, criteria) {
        var _a;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 3;
        if (!profileData.positions || !Array.isArray(profileData.positions))
            return 0;
        const experienceCount = profileData.positions.length;
        return experienceCount >= minCount ? maxScore : Math.round((experienceCount / minCount) * maxScore);
    }
    scoreEducation(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        return (profileData.educations && profileData.educations.length > 0) ? maxScore : 0;
    }
    scoreSkills(profileData, criteria) {
        var _a;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 3;
        if (!profileData.skills || !Array.isArray(profileData.skills))
            return 0;
        const skillCount = profileData.skills.length;
        return skillCount >= minCount ? maxScore : Math.round((skillCount / minCount) * maxScore);
    }
    scorePublications(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        // Check for publications in the profile data
        const publicationCount = ((_b = profileData.publications) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return publicationCount >= minCount ? maxScore : 0;
    }
    scoreLanguages(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        const languageCount = ((_b = profileData.languages) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return languageCount >= minCount ? maxScore : 0;
    }
    scoreCertificates(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        const certificateCount = ((_b = profileData.certifications) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return certificateCount >= minCount ? maxScore : 0;
    }
    scoreHonorsAwards(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        const honorsCount = ((_b = profileData.honors) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return honorsCount >= minCount ? maxScore : 0;
    }
    scoreVolunteer(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        const volunteerCount = ((_b = profileData.volunteerExperiences) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return volunteerCount >= minCount ? maxScore : 0;
    }
    scorePatents(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        // Check for patents in the profile data
        const patentCount = ((_b = profileData.patents) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return patentCount >= minCount ? maxScore : 0;
    }
    scoreTestScores(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        // Check for test scores in the profile data
        const testScoreCount = ((_b = profileData.testScores) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return testScoreCount >= minCount ? maxScore : 0;
    }
    scoreOrganizations(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        // Check for organizations in the profile data
        const organizationCount = ((_b = profileData.organizations) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return organizationCount >= minCount ? maxScore : 0;
    }
    scoreFeatured(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        // Check for featured content in the profile data
        const featuredCount = ((_b = profileData.featured) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return featuredCount >= minCount ? maxScore : 0;
    }
    scoreProjects(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        // Check for projects in the profile data
        const hasProjects = profileData.projects && profileData.projects.length > 0;
        return hasProjects ? maxScore : 0;
    }
    scoreRecommendations(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        // Check for recommendations in the profile data
        const recommendationCount = ((_b = profileData.recommendations) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return recommendationCount >= minCount ? maxScore : 0;
    }
    scoreCauses(profileData, criteria) {
        var _a, _b;
        const maxScore = parseInt(criteria.max_score);
        const minCount = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 1;
        // Check for causes in the profile data
        const causeCount = ((_b = profileData.causes) === null || _b === void 0 ? void 0 : _b.length) || 0;
        return causeCount >= minCount ? maxScore : 0;
    }
    scoreContactInfo(profileData, criteria) {
        const maxScore = parseInt(criteria.max_score);
        // Check if we have any contact information
        const hasContactInfo = profileData.followersCount !== undefined ||
            profileData.connectionsCount !== undefined ||
            profileData.pictureUrl;
        return hasContactInfo ? maxScore : 0;
    }
    getScoreDetails(profileData, criteria, score) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
        const section = criteria.section;
        const maxScore = parseInt(criteria.max_score);
        switch (section) {
            case "linkedInUrl":
                return profileData.inputUrl ? [`LinkedIn URL present (${score}/${maxScore})`] : [`No LinkedIn URL (${score}/${maxScore})`];
            case "country":
                const country = profileData.geoCountryName || profileData.countryCode;
                return country ? [`Country: ${country} (${score}/${maxScore})`] : [`No country specified (${score}/${maxScore})`];
            case "headline":
                if (criteria.criteria === "length") {
                    const wordCount = profileData.headline ? profileData.headline.trim().split(/\s+/).length : 0;
                    const minWords = ((_a = criteria.calculate) === null || _a === void 0 ? void 0 : _a.min) || 10;
                    return [`Headline: ${wordCount} words (min: ${minWords}) (${score}/${maxScore})`];
                }
                else if (criteria.criteria === "keywords") {
                    return [`Headline keywords analysis (${score}/${maxScore})`];
                }
                break;
            case "summary":
                if (criteria.criteria === "length") {
                    const wordCount = profileData.summary ? profileData.summary.trim().split(/\s+/).length : 0;
                    const minWords = ((_b = criteria.calculate) === null || _b === void 0 ? void 0 : _b.min) || 200;
                    return [`Summary: ${wordCount} words (min: ${minWords}) (${score}/${maxScore})`];
                }
                else if (criteria.criteria === "email") {
                    const hasEmail = profileData.summary && /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(profileData.summary);
                    return hasEmail ? [`Email found in summary (${score}/${maxScore})`] : [`No email in summary (${score}/${maxScore})`];
                }
                break;
            case "experiences":
                if (criteria.criteria === "notEmpty") {
                    const hasMeaningfulContent = profileData.positions && profileData.positions.some((pos) => pos.title && pos.title.trim().length > 0 &&
                        pos.companyName && pos.companyName.trim().length > 0);
                    return hasMeaningfulContent ? [`Experience content present (${score}/${maxScore})`] : [`No meaningful experience content (${score}/${maxScore})`];
                }
                else if (criteria.criteria === "length") {
                    const experienceCount = ((_c = profileData.positions) === null || _c === void 0 ? void 0 : _c.length) || 0;
                    const minCount = ((_d = criteria.calculate) === null || _d === void 0 ? void 0 : _d.min) || 3;
                    return [`Experiences: ${experienceCount} (min: ${minCount}) (${score}/${maxScore})`];
                }
                break;
            case "education":
                const educationCount = ((_e = profileData.educations) === null || _e === void 0 ? void 0 : _e.length) || 0;
                return [`Education entries: ${educationCount} (${score}/${maxScore})`];
            case "skills":
                const skillCount = ((_f = profileData.skills) === null || _f === void 0 ? void 0 : _f.length) || 0;
                const minCount = ((_g = criteria.calculate) === null || _g === void 0 ? void 0 : _g.min) || 3;
                return [`Skills: ${skillCount} (min: ${minCount}) (${score}/${maxScore})`];
            case "publications":
                const publicationCount = ((_h = profileData.publications) === null || _h === void 0 ? void 0 : _h.length) || 0;
                const pubMinCount = ((_j = criteria.calculate) === null || _j === void 0 ? void 0 : _j.min) || 1;
                return [`Publications: ${publicationCount} (min: ${pubMinCount}) (${score}/${maxScore})`];
            case "languages":
                const languageCount = ((_k = profileData.languages) === null || _k === void 0 ? void 0 : _k.length) || 0;
                const langMinCount = ((_l = criteria.calculate) === null || _l === void 0 ? void 0 : _l.min) || 1;
                return [`Languages: ${languageCount} (min: ${langMinCount}) (${score}/${maxScore})`];
            case "certificates":
                const certificateCount = ((_m = profileData.certifications) === null || _m === void 0 ? void 0 : _m.length) || 0;
                const certMinCount = ((_o = criteria.calculate) === null || _o === void 0 ? void 0 : _o.min) || 1;
                return [`Certifications: ${certificateCount} (min: ${certMinCount}) (${score}/${maxScore})`];
            case "honorsAwards":
                const honorsCount = ((_p = profileData.honors) === null || _p === void 0 ? void 0 : _p.length) || 0;
                const honorsMinCount = ((_q = criteria.calculate) === null || _q === void 0 ? void 0 : _q.min) || 1;
                return [`Honors/Awards: ${honorsCount} (min: ${honorsMinCount}) (${score}/${maxScore})`];
            case "volunteer":
                const volunteerCount = ((_r = profileData.volunteerExperiences) === null || _r === void 0 ? void 0 : _r.length) || 0;
                const volMinCount = ((_s = criteria.calculate) === null || _s === void 0 ? void 0 : _s.min) || 1;
                return [`Volunteer experiences: ${volunteerCount} (min: ${volMinCount}) (${score}/${maxScore})`];
            case "patents":
                const patentCount = ((_t = profileData.patents) === null || _t === void 0 ? void 0 : _t.length) || 0;
                const patentMinCount = ((_u = criteria.calculate) === null || _u === void 0 ? void 0 : _u.min) || 1;
                return [`Patents: ${patentCount} (min: ${patentMinCount}) (${score}/${maxScore})`];
            case "testScores":
                const testScoreCount = ((_v = profileData.testScores) === null || _v === void 0 ? void 0 : _v.length) || 0;
                const testMinCount = ((_w = criteria.calculate) === null || _w === void 0 ? void 0 : _w.min) || 1;
                return [`Test scores: ${testScoreCount} (min: ${testMinCount}) (${score}/${maxScore})`];
            case "organizations":
                const organizationCount = ((_x = profileData.organizations) === null || _x === void 0 ? void 0 : _x.length) || 0;
                const orgMinCount = ((_y = criteria.calculate) === null || _y === void 0 ? void 0 : _y.min) || 1;
                return [`Organizations: ${organizationCount} (min: ${orgMinCount}) (${score}/${maxScore})`];
            case "featured":
                const featuredCount = ((_z = profileData.featured) === null || _z === void 0 ? void 0 : _z.length) || 0;
                const featMinCount = ((_0 = criteria.calculate) === null || _0 === void 0 ? void 0 : _0.min) || 1;
                return [`Featured content: ${featuredCount} (min: ${featMinCount}) (${score}/${maxScore})`];
            case "projects":
                const hasProjects = profileData.projects && profileData.projects.length > 0;
                return hasProjects ? [`Projects present (${score}/${maxScore})`] : [`No projects (${score}/${maxScore})`];
            case "recommendations":
                const recommendationCount = ((_1 = profileData.recommendations) === null || _1 === void 0 ? void 0 : _1.length) || 0;
                const recMinCount = ((_2 = criteria.calculate) === null || _2 === void 0 ? void 0 : _2.min) || 1;
                return [`Recommendations: ${recommendationCount} (min: ${recMinCount}) (${score}/${maxScore})`];
            case "causes":
                const causeCount = ((_3 = profileData.causes) === null || _3 === void 0 ? void 0 : _3.length) || 0;
                const causeMinCount = ((_4 = criteria.calculate) === null || _4 === void 0 ? void 0 : _4.min) || 1;
                return [`Causes: ${causeCount} (min: ${causeMinCount}) (${score}/${maxScore})`];
            case "contactInfo":
                const hasContactInfo = profileData.followersCount !== undefined ||
                    profileData.connectionsCount !== undefined ||
                    profileData.pictureUrl;
                return hasContactInfo ? [`Contact info present (${score}/${maxScore})`] : [`No contact info (${score}/${maxScore})`];
            default:
                return [`${section}: ${score}/${maxScore}`];
        }
        return [`${section}: ${score}/${maxScore}`];
    }
    calculateGrade(percentage) {
        if (percentage >= 90)
            return "A+";
        if (percentage >= 85)
            return "A";
        if (percentage >= 80)
            return "A-";
        if (percentage >= 75)
            return "B+";
        if (percentage >= 70)
            return "B";
        if (percentage >= 65)
            return "B-";
        if (percentage >= 60)
            return "C+";
        if (percentage >= 55)
            return "C";
        if (percentage >= 50)
            return "C-";
        if (percentage >= 45)
            return "D+";
        if (percentage >= 40)
            return "D";
        if (percentage >= 35)
            return "D-";
        return "F";
    }
}
exports.ScoreService = ScoreService;
//# sourceMappingURL=score.service.js.map