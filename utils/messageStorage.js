const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lastMessageId.json');

function saveMessageId(messageId) {
    fs.writeFileSync(filePath, JSON.stringify({ messageId }));
}

function loadMessageId() {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        const parsed = JSON.parse(data);
        return parsed.messageId;
    }
    return null;
}

function deleteMessageId() {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

module.exports = {
    saveMessageId,
    loadMessageId,
    deleteMessageId,
};
