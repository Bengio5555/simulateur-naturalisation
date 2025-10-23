const { Resend } = require('resend');

const ADMIN_EMAIL = 'contact@mondossierfrancais.fr'; // 🔴 CHANGEZ CECI
const FROM_EMAIL = 'contact@mondossierfrancais.fr';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const { userEmail, userName, userPhone, documentList } = req.body;

        if (!userEmail || !userName || !documentList) {
            return res.status(400).json({ 
                error: 'Données manquantes'
            });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject: '📋 Votre liste personnalisée - Naturalisation française',
            html: documentList
        });

        await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: '🆕 Nouveau prospect - Simulateur',
            html: `
                <div style="font-family: Arial, sans-serif;">
                    <h2>Nouveau Prospect</h2>
                    <p><strong>Nom :</strong> ${userName}</p>
                    <p><strong>Email :</strong> ${userEmail}</p>
                    <p><strong>Téléphone :</strong> ${userPhone}</p>
                    <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
                </div>
            `
        });

        return res.status(200).json({ 
            success: true,
            message: 'Emails envoyés'
        });

    } catch (error) {
        console.error('Erreur:', error);
        return res.status(500).json({ 
            error: 'Erreur lors de l\'envoi',
            details: error.message 
        });
    }
};
