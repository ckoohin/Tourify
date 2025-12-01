require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function generateBookingUrl(tourSlug, tourId) {
    return `${FRONTEND_URL}/booking/${tourSlug}?tour_id=${tourId}`;
}

function generateVersionBookingUrl(tourSlug, tourVersionId) {
    return `${FRONTEND_URL}/booking/${tourSlug}?version_id=${tourVersionId}`;
}

module.exports = {
    generateBookingUrl,
    generateVersionBookingUrl
};