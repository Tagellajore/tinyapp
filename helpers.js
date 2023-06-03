const getUserByEmail = function(email, users) {
  for(const userId in users) {
    if(users[userId].email === email) {
      return users[userId];
    }
  }
  return undefined;
};

function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  for (let i = 0; i <6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

module.exports = { getUserByEmail, generateRandomString };