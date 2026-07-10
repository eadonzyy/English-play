import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { text } = req.query;
    if (!text) return res.status(400).json({ error: "Missing text" });

    try {
        const url = `https://googleapis.com{encodeURIComponent(text)}`;
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        if (response.ok) {
            const data = await response.json();
            if (data && data[0]) {
                let translated = "";
                data[0].forEach(part => { if (part && part[0]) translated += part[0]; });
                return res.status(200).json({ translation: translated });
            }
        }
    } catch (e) {
        console.error(e);
    }
    
    return res.status(200).json({ translation: "翻譯失敗，請手動補充" });
}
