const fs = require('fs');
const axios = require('axios');

async function fetchAndSaveData() {
    try {
        console.log('Starting to fetch data...');
        const rolls = fs.readFileSync('roll.txt', 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
        const names = fs.readFileSync('name.txt', 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
        const urls = fs.readFileSync('urls.txt', 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);
        const sections = fs.readFileSync('sections.txt', 'utf-8').split('\n').map(line => line.trim()).filter(Boolean);

        if (rolls.length !== names.length || names.length !== urls.length || names.length !== sections.length) {
            console.error('Error: The number of rolls, names, URLs, and sections do not match.');
            return;
        }

        const combinedData = [];
        for (let i = 0; i < rolls.length; i++) {
            const roll = rolls[i];
            const name = names[i];
            const url = urls[i];
            const section = sections[i];
            let studentData = { roll, name, url, section };

            if (url.startsWith('https://leetcode.com/')) {
                const username = url.split('/').filter(Boolean).pop();

                try {
                    // Fetch submission stats
                    const statsResponse = await axios.get(`https://leetcodeapi-v1.vercel.app/api/stats/${username}`);
                    const statsData = statsResponse.data;

                    // Fetch rank from LeetCode GraphQL API
                    const query = `
                      query getUserRank($username: String!) {
                        matchedUser(username: $username) {
                          profile {
                            ranking
                          }
                        }
                      }
                    `;
                    const rankResponse = await axios.post(
                        'https://leetcode.com/graphql',
                        { query, variables: { username } },
                        { headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' } }
                    );

                    const rankData = rankResponse.data;
                    const rank = rankData.data?.matchedUser?.profile?.ranking || 'N/A';

                    studentData = {
                        ...studentData,
                        username,
                        totalSolved: statsData.totalSolved || 0,
                        easySolved: statsData.easySolved || 0,
                        mediumSolved: statsData.mediumSolved || 0,
                        hardSolved: statsData.hardSolved || 0,
                        leetCodeRank: rank,
                    };
                } catch (error) {
                    console.error(`Error fetching data for ${username}:`, error.message);
                }
            } else {
                studentData.info = 'No LeetCode data available';
            }
            combinedData.push(studentData);
        }

        // Sort and save the data
        combinedData.sort((a, b) => (b.totalSolved || 0) - (a.totalSolved || 0));
        fs.writeFileSync('data.json', JSON.stringify(combinedData, null, 2));
        console.log('Data refreshed and saved to data.json successfully.');
    } catch (error) {
        console.error('Error during data refresh:', error.message);
    }
}

// Automatically refresh data every hour
const REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
setInterval(fetchAndSaveData, REFRESH_INTERVAL);

// Initial fetch when the server starts
fetchAndSaveData();
