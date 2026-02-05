const validator = require("validator");

const validateSignupData = (req) => {
    const { firstName, email, password, age, gender, photoUrl, about, skills } =
        req.body;

    if (!firstName || firstName.length < 3 || firstName.length > 30) {
        throw new Error("First name must be between 3 and 30 characters long");
    }
    if (!email || !validator.isEmail(email)) {
        throw new Error("Invalid email format");
    }
    if (!password) {
        throw new Error("Password is required");
    }
    if (password && !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })) {
        throw new Error(
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
        );
    }
    if (age && age < 18) {
        throw new Error("Age must be at least 18");
    }
    if (gender) {
        const allowedGenders = ["male", "female", "other"];
        if (!allowedGenders.includes(gender.toLowerCase())) {
            throw new Error("Gender must between male, female, or other");
        }
    }
    if (photoUrl && !validator.isURL(photoUrl)) {
        throw new Error("Invalid URL format for photoUrl");
    }
    if (skills) {
        // Check duplicates
        const normalizedSkills = skills.map((skill) => skill.trim().toLowerCase());
        const uniqueSkills = new Set(normalizedSkills);

        if (uniqueSkills.size !== normalizedSkills.length) {
            throw new Error("Duplicate skills are not allowed");
        }
        if (
            !Array.isArray(skills) ||
            !skills.every((skill) => typeof skill === "string")
        ) {
            throw new Error("Skills must be an array of strings");
        }
    }
};

const validateEditProfileData = (req) => {
    const requestData = Object.keys(req.data);

    // 1. Validation: Ensure the body isn't empty
    if (requestData.length === 0) {
        return res.status(400).json({ message: "No update data provided" });
    }

    const allowedEditFields = ["firstName", "lastName", "emailId", "photoUrl", "gender", "age"];

    const isAllowed = requestData.every((ele) => {
        return allowedEditFields.includes(ele);
    })

    if(!isAllowed) {
        throw new Error("Invalid Update fields");
    }
}

const validateConnectionRequestData = (req) => {
    const allowedStatuses = ['interested', 'ignored'];
    const { status } = req.params;
    if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid status");
    }

    // Validate toUserId
    const toUserId = req.params.userId;

    if (!toUserId || !validator.isMongoId(toUserId)) {
        throw new Error("Invalid toUserId");
    }

}

module.exports = {
    validateSignupData,
    validateEditProfileData,
    validateConnectionRequestData
};
