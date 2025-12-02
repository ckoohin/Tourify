const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

async function generateTourQRCode(tourId, tourCode, bookingUrl) {
    try {
        const qrDir = path.join(__dirname, '../public/qrcodes');
        await fs.mkdir(qrDir, { recursive: true });

        const filename = `tour-${tourCode}-${tourId}.png`;
        const filePath = path.join(qrDir, filename);

        await QRCode.toFile(filePath, bookingUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return `/qrcodes/${filename}`;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Không thể tạo QR code');
    }
}

async function deleteQRCode(qrCodeUrl) {
    try {
        if (!qrCodeUrl) return;
        
        const filename = path.basename(qrCodeUrl);
        const filePath = path.join(__dirname, '../public/qrcodes', filename);
        
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting QR code:', error);
    }
}

module.exports = {
    generateTourQRCode,
    deleteQRCode
};