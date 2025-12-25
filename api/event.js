export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { event_name, event_time, user_data, custom_data, event_source_url, action_source } = req.body || {};

        // Hardcoded credentials as requested for this setup
        const PIXEL_ID = '1205985968296722';
        const ACCESS_TOKEN = 'EAAMUjtjSwi8BQXNTwbBqARi9zB9VNj6mZCng7b5rUSPsEgVWFOYlJ41D01C9dDvUs879FNE2AlZBO5XscnqIYFvUCqvKaWP04T5BcQDYkdsa4oV0N2jh8N14xjgBPOTpJt9eWftKjlke6tCKNLuaI11zn2zAP3RxXBkitmYWHfW5vqmMYhNUAxECUGGQZDZD';

        if (!event_name || !user_data) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const payload = {
            data: [
                {
                    event_name: event_name,
                    event_time: event_time || Math.floor(Date.now() / 1000),
                    action_source: action_source || 'website',
                    event_source_url: event_source_url,
                    user_data: {
                        client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                        client_user_agent: req.headers['user-agent'],
                        fbc: user_data.fbc,
                        fbp: user_data.fbp,
                        ...user_data
                    },
                    custom_data: custom_data,
                },
            ],
        };

        const response = await fetch(
            `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Meta CAPI Error:', data);
            return res.status(response.status).json(data);
        }

        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
