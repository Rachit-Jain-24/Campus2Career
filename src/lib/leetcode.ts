export interface LeetCodeData {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalEasy: number;
    totalMedium: number;
    totalHard: number;
    ranking: number;
    acceptanceRate: number;
    streak: number;
    submissionCalendar: string; // JSON string
    recentSubmissions: {
        title: string;
        titleSlug: string;
        timestamp: string;
        statusDisplay: string;
        lang: string;
    }[];
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeData | null> {
    if (!username) return null;

    try {
        // Using a more consolidated API that returns more info in one request
        const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${username}`);
        if (res.ok) {
            const data = await res.json();

            // Calculate a simple streak from the submission calendar if not provided
            const calendar = data.submissionCalendar || {};
            let streak = 0;
            const timestamps = Object.keys(calendar).map(Number).sort((a, b) => b - a);
            if (timestamps.length > 0) {
                const now = Math.floor(Date.now() / 1000);
                const day = 86400;
                let current = Math.floor(now / day) * day;

                // If the last submission was today or yesterday
                if (timestamps[0] >= current - day) {
                    let lastTs = timestamps[0];
                    streak = 1;
                    for (let i = 1; i < timestamps.length; i++) {
                        if (timestamps[i] >= lastTs - (day * 1.5) && timestamps[i] < lastTs) {
                            streak++;
                            lastTs = timestamps[i];
                        } else if (timestamps[i] < lastTs - (day * 1.5)) {
                            break;
                        }
                    }
                }
            }

            return {
                totalSolved: data.totalSolved || 0,
                easySolved: data.easySolved || 0,
                mediumSolved: data.mediumSolved || 0,
                hardSolved: data.hardSolved || 0,
                totalEasy: data.totalEasy || 1000,
                totalMedium: data.totalMedium || 1000,
                totalHard: data.totalHard || 500,
                ranking: data.ranking || 0,
                acceptanceRate: parseFloat(data.acceptanceRate) || 0,
                streak: streak,
                submissionCalendar: JSON.stringify(calendar),
                recentSubmissions: data.recentSubmissions || []
            };
        }
    } catch (error) {
        console.error('Primary LeetCode API failed', error);
    }

    try {
        // Fallback: This API usually takes 3 calls, but let's try to get the basics safely
        const proxyUrl = `https://corsproxy.io/?url=https://alfa-leetcode-api.onrender.com/${username}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
            const data = await response.json();
            return {
                totalSolved: data.totalSolved || 0,
                easySolved: data.easySolved || 0,
                mediumSolved: data.mediumSolved || 0,
                hardSolved: data.hardSolved || 0,
                totalEasy: 1000,
                totalMedium: 1000,
                totalHard: 500,
                ranking: data.ranking || 0,
                acceptanceRate: data.acceptanceRate || 0,
                streak: 0,
                submissionCalendar: "{}",
                recentSubmissions: []
            };
        }
    } catch (innerError) {
        console.error('Fallback fetch also failed', innerError);
    }

    return null;
}
