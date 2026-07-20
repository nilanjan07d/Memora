require("dotenv").config();
const cloudinary = require("./config/cloudinary");

(async () => {
  try {
    const result = await cloudinary.uploader.upload(
      "C:\\Users\\USER\\AppData\\Local\\Temp\\coverImage-1784217435299-740790740.jpg"
    );

    console.log(result);
  } catch (err) {
    console.dir(err, { depth: null });
  }
})();