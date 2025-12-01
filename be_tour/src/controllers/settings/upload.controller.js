require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

exports.getCloudinarySignature = async (req, res, next) => {
  try {
    const paramsToSign = req.body.paramsToSign || {};
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        ...paramsToSign
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      data: { timestamp, signature }
    });

  } catch (err) {
    next(err);
  }
};