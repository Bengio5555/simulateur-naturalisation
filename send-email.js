// api/send-email.js
// Version serverless pour Vercel
// 
// Installation:
// 1. Créez un dossier "api" à la racine de votre projet
// 2. Placez ce fichier dedans
// 3. Dans le dashboard Vercel, ajoutez la variable d'environnement RESEND_API_KEY
// 4. L'endpoint sera automatiquement disponible à: https://votre-projet.vercel.app/api/send-email

const { Resend } = require('resend');

// Configuration
const ADMIN_EMAIL = 'votre-email@exemple.com'; // À REMPLACER
const FROM_EMAIL = 'onboarding@resend.dev'; // À REMPLACER par votre domaine vérifié

module.exports = async (req, res) => {
    // Gérer CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Répondre aux requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Seules les requêtes POST sont acceptées
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    try {
        const { userEmail, userName, userPhone, documentList } = req.body;

        // Validation
        if (!userEmail || !userName || !documentList) {
            return res.status(400).json({ 
                error: 'Données manquantes',
                required: ['userEmail', 'userName', 'documentList']
            });
        }

        // Initialiser Resend
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Email à l'utilisateur
        const userEmailResult = await resend.emails.send({
            from: FROM_EMAIL,
            to: userEmail,
            subject: '📋 Votre liste personnalisée - Naturalisation française',
            html: documentList
        });

        // Email à l'admin
        const adminEmailResult = await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: '🆕 Nouveau prospect - Simulateur Naturalisation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">🆕 Nouveau Prospect</h1>
                        <p style="color: white; margin-top: 10px;">Simulateur de Naturalisation</p>
                    </div>
                    <div style="padding: 30px; background: #f7fafc;">
                        <h2 style="color: #667eea;">Coordonnées du prospect</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 15px 0; font-weight: bold; color: #4a5568;">Nom complet :</td>
                                <td style="padding: 15px 0; color: #2d3748;">${userName}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 15px 0; font-weight: bold; color: #4a5568;">Email :</td>
                                <td style="padding: 15px 0; color: #2d3748;">
                                    <a href="mailto:${userEmail}" style="color: #667eea;">${userEmail}</a>
                                </td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 15px 0; font-weight: bold; color: #4a5568;">Téléphone :</td>
                                <td style="padding: 15px 0; color: #2d3748;">
                                    <a href="tel:${userPhone}" style="color: #667eea;">${userPhone}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 15px 0; font-weight: bold; color: #4a5568;">Date :</td>
                                <td style="padding: 15px 0; color: #2d3748;">${new Date().toLocaleString('fr-FR')}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 30px; padding: 20px; background: #e6f3ff; border-left: 4px solid #667eea; border-radius: 5px;">
                            <p style="margin: 0; color: #2d3748;">
                                <strong>💡 Action recommandée :</strong><br>
                                Contactez ce prospect dans les 24h pour maximiser vos chances de conversion.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        console.log('✅ Emails envoyés:', {
            user: userEmailResult.data.id,
            admin: adminEmailResult.data.id
        });

        return res.status(200).json({ 
            success: true,
            message: 'Emails envoyés avec succès',
            userEmailId: userEmailResult.data.id,
            adminEmailId: adminEmailResult.data.id
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        return res.status(500).json({ 
            error: 'Erreur lors de l\'envoi des emails',
            details: error.message 
        });
    }
};