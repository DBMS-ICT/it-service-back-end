import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import { tryCatch } from "../utils/tryCatch.js";
import CustomError from "../CustomError.js";

// Set up multer storage and file filter
const multerStorage = multer.memoryStorage();

// Check if the file buffer matches any signature
export const fileFilter = (fileBuffer) => {
	const signatures = [
		{ signature: Buffer.from([0xff, 0xd8, 0xff]), mime: "image/jpeg" },
		{
			signature: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
			mime: "image/png",
		},
		{
			signature: Buffer.from([0x25, 0x50, 0x44, 0x46]),
			mime: "application/pdf",
		}, // PDF signature
		{
			signature: Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
			mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		}, // DOC signature
	];

	for (const { signature, mime } of signatures) {
		if (fileBuffer.slice(0, signature.length).equals(signature)) {
			return mime;
		}
	}
	return null;
};

// Create the multer upload instance with the updated file filter
const upload = multer({ storage: multerStorage });

// Upload a single file
export const uploadSingle = upload.single("file");

// Middleware to resize files
export const resizeFile = tryCatch(async (req, res) => {
	if (!req.file) {
		const error = new CustomError("Not Allowed Upload!", 405, "5000");
		return res.json(error);
	}

	let originalExtension = req.file.mimetype.split("/")[1];
	if (
		originalExtension === "png" ||
		originalExtension === "jpg" ||
		originalExtension === "jpeg"
	) {
		originalExtension = "jpeg";
	} else if (
		originalExtension ===
		"vnd.openxmlformats-officedocument.wordprocessingml.document"
	) {
		originalExtension = "docx";
	}
	// Save File with original extension
	const fileName = `file-${Date.now()}-${Math.round(
		Math.random() * 9999
	)}.${originalExtension}`;

	if (originalExtension === "jpeg") {
		await sharp(req.file.buffer)
			.resize(500)
			.toFormat("jpeg")
			.jpeg({ quality: 90 })
			.toFile(`uploads/images/${fileName}`);
	} else {
		// Write the file buffer to the upload path
		fs.writeFile(`uploads/files/${fileName}`, req.file.buffer, (err) => {
			if (err) res.status(500).json({ status: "fail", error: err });
		});
	}
	res.status(200).json({ status: "success", path: fileName });
});