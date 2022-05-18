const { randomBytes } = require("crypto");

function setGeneratedId(event) {
	event.params.data.lessonId = randomBytes(4).toString("hex");
}

module.exports = {
	beforeCreate(event) {
		setGeneratedId(event);
	},
	beforeUpdate(event) {
		if (event.params.data.lessonId === "tbd") {
			setGeneratedId(event);
		}
	}
};
