export const SCORING_CRITERIA = [
    {
      section: "linkedInUrl",
      criteria: "check",
      max_score: "5"
    },
    {
      section: "country",
      criteria: "notEmpty",
      max_score: "5"
    },
    {
      section: "headline",
      criteria: "length",
      calculate: {
        type: "words",
        min: 10
      },
      max_score: "20"
    },
    {
      section: "headline",
      criteria: "keywords",
      max_score: "10"
    },
    {
      section: "summary",
      criteria: "length",
      calculate: {
        type: "words",
        min: 200
      },
      max_score: "20"
    },
    {
      section: "summary",
      criteria: "email",
      max_score: "10"
    },
    {
      section: "experiences",
      criteria: "notEmpty",
      calculate: {
        section: "description"
      },
      max_score: "10"
    },
    {
      section: "experiences",
      criteria: "length",
      calculate: {
        min: 3
      },
      max_score: "10"
    },
    {
      section: "education",
      criteria: "notEmpty",
      max_score: "10"
    },
    {
      section: "skills",
      criteria: "length",
      calculate: {
        min: 3
      },
      max_score: "15"
    },
    {
      section: "publications",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "languages",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "certificates",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "honorsAwards",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "volunteer",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "patents",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "testScores",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "organizations",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "featured",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "projects",
      criteria: "notEmpty",
      max_score: "1"
    },
    {
      section: "recommendations",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "causes",
      criteria: "length",
      calculate: {
        min: 1
      },
      max_score: "1"
    },
    {
      section: "contactInfo",
      criteria: "notEmpty",
      max_score: "1"
    }
  ];