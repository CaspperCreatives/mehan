import { ScoreService } from './src/services/score.service';

// Sample profile data from the user
const profileData = {
    "success": true,
    "data": [
        {
            "id": "617472312",
            "profileId": "ACoAACTN4TgBpusMem1FxAfDNtBaeMXzc1DN38c",
            "firstName": "mohammad",
            "lastName": "omari",
            "occupation": "Mid-Senior Frontend developer",
            "publicIdentifier": "mohammad-omari-620959152",
            "trackingId": "Dg956mo0SDeRmo2gjlpy8Q==",
            "pictureUrl": "https://media.licdn.com/dms/image/v2/D4E03AQEgx5JEGssa_A/profile-displayphoto-scale_100_100/B4EZfA6yqUHcAc-/0/1751288327700?e=1758758400&v=beta&t=vWE4G0cA1bFA2PcStGT8iWwh9rswe7cI7Cyfdp5dDWE",
            "countryCode": "jo",
            "geoUrn": "urn:li:fs_geo:105255939",
            "positions": [
                {
                    "title": "Frontend Developer",
                    "timePeriod": {
                        "startDate": {
                            "month": 3,
                            "year": 2025
                        }
                    },
                    "company": {
                        "employeeCountRange": {
                            "start": 201,
                            "end": 500
                        },
                        "industries": [
                            "Banking"
                        ],
                        "objectUrn": "urn:li:company:163243",
                        "entityUrn": "urn:li:fs_miniCompany:163243",
                        "name": "CR2",
                        "showcase": false,
                        "active": true,
                        "logo": "https://media.licdn.com/dms/image/v2/D4E0BAQFYS7sfinqJPA/company-logo_200_200/company-logo_200_200/0/1727941170132/cr2_logo?e=1758758400&v=beta&t=BpYABGOr1QTlKWFe6YjIOoyrgXebgOE5IFQvJRbJtS4",
                        "universalName": "cr2",
                        "dashCompanyUrn": "urn:li:fsd_company:163243",
                        "trackingId": "0NfT0a1LTx+Lha17BNF5TQ=="
                    },
                    "companyName": "CR2"
                },
                {
                    "title": "Mid-Senior frontend developer",
                    "locationName": "Amman, Jordan",
                    "timePeriod": {
                        "endDate": {
                            "month": 3,
                            "year": 2025
                        },
                        "startDate": {
                            "month": 7,
                            "year": 2023
                        }
                    },
                    "company": {
                        "employeeCountRange": {
                            "start": 201,
                            "end": 500
                        },
                        "industries": [
                            "E-Learning"
                        ],
                        "objectUrn": "urn:li:company:2872181",
                        "entityUrn": "urn:li:fs_miniCompany:2872181",
                        "name": "Classera",
                        "showcase": false,
                        "active": true,
                        "logo": "https://media.licdn.com/dms/image/v2/C4D0BAQGpI0Jy_S9YeQ/company-logo_200_200/company-logo_200_200/0/1630509658642/classera_inc__logo?e=1758758400&v=beta&t=e1xlDuc0V35RtHHBprsqOkvQJhizhzKfzxpwGJiic1Y",
                        "universalName": "classera-inc-",
                        "dashCompanyUrn": "urn:li:fsd_company:2872181",
                        "trackingId": "2iOYZvdVQjGu2MSDEhJ3Bw=="
                    },
                    "companyName": "Classera"
                },
                {
                    "title": "Frontend Developer",
                    "locationName": "Amman, Jordan",
                    "timePeriod": {
                        "endDate": {
                            "month": 3,
                            "year": 2025
                        },
                        "startDate": {
                            "month": 4,
                            "year": 2021
                        }
                    },
                    "company": {
                        "employeeCountRange": {
                            "start": 201,
                            "end": 500
                        },
                        "industries": [
                            "E-Learning"
                        ],
                        "objectUrn": "urn:li:company:2872181",
                        "entityUrn": "urn:li:fs_miniCompany:2872181",
                        "name": "Classera",
                        "showcase": false,
                        "active": true,
                        "logo": "https://media.licdn.com/dms/image/v2/C4D0BAQGpI0Jy_S9YeQ/company-logo_200_200/company-logo_200_200/0/1630509658642/classera_inc__logo?e=1758758400&v=beta&t=e1xlDuc0V35RtHHBprsqOkvQJhizhzKfzxpwGJiic1Y",
                        "universalName": "classera-inc-",
                        "dashCompanyUrn": "urn:li:fsd_company:2872181",
                        "trackingId": "cI1CvKk1RRi4ZFaApxap1g=="
                    },
                    "companyName": "Classera"
                },
                {
                    "title": "Full-stack Developer",
                    "timePeriod": {
                        "endDate": {
                            "month": 4,
                            "year": 2021
                        },
                        "startDate": {
                            "month": 12,
                            "year": 2020
                        }
                    },
                    "company": {
                        "employeeCountRange": {
                            "start": 201,
                            "end": 500
                        },
                        "industries": [
                            "E-Learning"
                        ],
                        "objectUrn": "urn:li:company:2872181",
                        "entityUrn": "urn:li:fs_miniCompany:2872181",
                        "name": "Classera",
                        "showcase": false,
                        "active": true,
                        "logo": "https://media.licdn.com/dms/image/v2/C4D0BAQGpI0Jy_S9YeQ/company-logo_200_200/company-logo_200_200/0/1630509658642/classera_inc__logo?e=1758758400&v=beta&t=e1xlDuc0V35RtHHBprsqOkvQJhizhzKfzxpwGJiic1Y",
                        "universalName": "classera-inc-",
                        "dashCompanyUrn": "urn:li:fsd_company:2872181",
                        "trackingId": "0rakSCPGT0S80c1Fl3h/8Q=="
                    },
                    "companyName": "Classera"
                }
            ],
            "educations": [
                {
                    "schoolName": "Yarmouk University",
                    "timePeriod": {
                        "endDate": {
                            "year": 2019
                        },
                        "startDate": {
                            "year": 2015
                        }
                    }
                }
            ],
            "certifications": [],
            "courses": [],
            "honors": [],
            "languages": [],
            "skills": [
                "Ionic Framework",
                "Angular Material",
                "Angular CLI",
                "Bitbucket"
            ],
            "volunteerExperiences": [],
            "headline": "Mid-Senior Frontend developer ",
            "summary": "As a Mid-Senior Frontend Developer at Classera, I've translated complex concepts into user-friendly applications that enhance user experience and engagement. My educational foundation from Yarmouk University couples with hands-on skills in Angular (js and 18+), JavaScript, and HTML5, empowering me to contribute effectively to our dynamic team's goals.\n\nMy proficiency in TypeScript and NodeJs complements my frontend expertise, allowing for seamless full-stack development when needed. Dedicated to continuous learning and improvement, I am passionate about exploring new technologies and methodologies to keep our products at the forefront of the education technology industry.",
            "student": false,
            "industryName": "Software Development",
            "industryUrn": "urn:li:fs_industry:4",
            "geoLocationName": "Amman",
            "geoCountryName": "Jordan",
            "jobTitle": "Frontend Developer",
            "companyName": "CR2",
            "companyPublicId": "cr2",
            "companyLinkedinUrl": "https://www.linkedin.com/company/cr2",
            "following": false,
            "followable": true,
            "followersCount": 815,
            "connectionsCount": 500,
            "connectionType": "",
            "inputUrl": "https://www.linkedin.com/in/mohammad-omari-620959152/"
        }
    ]
};

// Test the scoring service
function testScoreService(): void {
    try {
        const scoreService = new ScoreService();
        const profile = profileData.data[0]; // Get the first profile
        
        console.log('Testing ScoreService with profile data...');
        console.log('Profile:', profile.firstName, profile.lastName);
        console.log('Headline:', profile.headline);
        console.log('Skills count:', profile.skills?.length || 0);
        console.log('Experiences count:', profile.positions?.length || 0);
        console.log('Education count:', profile.educations?.length || 0);
        console.log('Followers:', profile.followersCount);
        console.log('Connections:', profile.connectionsCount);
        
        const score = scoreService.calculateProfileScore(profile);
        
        console.log('\n=== SCORING RESULTS ===');
        console.log(`Total Score: ${score.totalScore}/${score.maxTotalScore}`);
        console.log(`Percentage: ${score.percentage}%`);
        console.log(`Grade: ${score.grade}`);
        
        console.log('\n=== SECTION BREAKDOWN ===');
        score.sectionScores.forEach(section => {
            console.log(`${section.section}: ${section.score}/${section.maxScore} - ${section.details}`);
        });
        
    } catch (error) {
        console.error('Error testing ScoreService:', error);
    }
}

// Run the test
testScoreService();
