/**
 * External API Service
 * Fetches real-time data from GitHub and LeetCode
 */

const axios = require('axios');
const { getPracticeData } = require('./supabaseService');

/**
 * Fetch GitHub contribution data for a user
 * @param {string} username - GitHub username
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Contribution data by date
 */
async function fetchGitHubContributions(username, startDate, endDate) {
  try {
    // GitHub GraphQL API for contribution data
    const query = `
      query($userName:String!, $from:DateTime!, $to:DateTime!) {
        user(login: $userName) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GitHub token not configured. Using public API (limited).');
    }

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query,
        variables: {
          userName: username,
          from: `${startDate}T00:00:00Z`,
          to: `${endDate}T23:59:59Z`,
        },
      },
      { headers }
    );

    if (response.data.errors) {
      console.error('GitHub API errors:', response.data.errors);
      throw new Error(response.data.errors[0]?.message || 'GitHub API error');
    }

    const contributionDays = response.data.data?.user?.contributionsCollection?.contributionCalendar?.weeks
      ?.flatMap(week => week.contributionDays) || [];

    // Convert to date-keyed object
    const dataByDate = {};
    contributionDays.forEach(day => {
      dataByDate[day.date] = {
        date: day.date,
        github: day.contributionCount > 0,
        github_count: day.contributionCount,
      };
    });

    return dataByDate;
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    throw error;
  }
}

/**
 * Fetch LeetCode submission data for a user
 * @param {string} username - LeetCode username
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Submission data by date
 */
async function fetchLeetCodeSubmissions(username, startDate, endDate) {
  try {
    // LeetCode GraphQL API
    const query = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          timestamp
          title
          titleSlug
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query,
        variables: {
          username,
          limit: 500, // Fetch up to 500 recent submissions
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
      }
    );

    if (response.data.errors) {
      console.error('LeetCode API errors:', response.data.errors);
      throw new Error(response.data.errors[0]?.message || 'LeetCode API error');
    }

    const submissions = response.data.data?.recentAcSubmissionList || [];

    // Filter by date range and group by date
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dataByDate = {};

    submissions.forEach(submission => {
      const submissionDate = new Date(parseInt(submission.timestamp) * 1000);
      
      if (submissionDate >= start && submissionDate <= end) {
        const dateStr = submissionDate.toISOString().split('T')[0];
        
        if (!dataByDate[dateStr]) {
          dataByDate[dateStr] = {
            date: dateStr,
            leetcode: true,
            leetcode_count: 0,
            problems: [],
          };
        }
        
        dataByDate[dateStr].leetcode_count++;
        dataByDate[dateStr].problems.push({
          title: submission.title,
          slug: submission.titleSlug,
        });
      }
    });

    return dataByDate;
  } catch (error) {
    console.error('Error fetching LeetCode data:', error.message);
    throw error;
  }
}

/**
 * Combine GitHub and LeetCode data for a date range
 * @param {string} githubUsername - GitHub username
 * @param {string} leetcodeUsername - LeetCode username
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Combined practice data
 */
async function fetchCombinedPracticeData(githubUsername, leetcodeUsername, startDate, endDate) {
  try {
    // Fetch data from all sources in parallel
    const [githubData, leetcodeData, dbResult] = await Promise.all([
      fetchGitHubContributions(githubUsername, startDate, endDate).catch(err => {
        console.error('GitHub fetch failed:', err.message);
        return {};
      }),
      fetchLeetCodeSubmissions(leetcodeUsername, startDate, endDate).catch(err => {
        console.error('LeetCode fetch failed:', err.message);
        return {};
      }),
      getPracticeData(startDate, endDate).catch(err => {
        console.error('Database fetch failed:', err.message);
        return { data: [] };
      }),
    ]);

    // Convert database data to date-keyed object for easy lookup
    const dbData = {};
    if (dbResult.data && Array.isArray(dbResult.data)) {
      dbResult.data.forEach(record => {
        dbData[record.date] = record;
      });
    }

    // Merge data by date (combine all sources)
    const allDates = new Set([
      ...Object.keys(githubData),
      ...Object.keys(leetcodeData),
      ...Object.keys(dbData),
    ]);

    const combinedData = Array.from(allDates).map(date => {
      const github = githubData[date] || {};
      const leetcode = leetcodeData[date] || {};
      const dbRecord = dbData[date] || {};

      return {
        date,
        // Live data from APIs (always fresh)
        github: github.github || false,
        github_count: github.github_count || 0,
        leetcode: leetcode.leetcode || false,
        leetcode_count: leetcode.leetcode_count || 0,
        leetcode_problems: leetcode.problems || [],
        // English practice data from database
        writing_submitted: dbRecord.writing_submitted || false,
        writing_chars: dbRecord.writing_chars || 0,
        writing_words: dbRecord.writing_words || 0,
        speaking_detected: dbRecord.speaking_detected || false,
        // Additional data
        notes: dbRecord.notes || null,
        updated_at: dbRecord.updated_at || null,
      };
    });

    // Sort by date descending
    combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));

    return combinedData;
  } catch (error) {
    console.error('Error combining practice data:', error.message);
    throw error;
  }
}

module.exports = {
  fetchGitHubContributions,
  fetchLeetCodeSubmissions,
  fetchCombinedPracticeData,
};
