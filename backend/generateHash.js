const bcrypt = require('bcrypt');

const generatePasswordHash = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(hash);
};

generatePasswordHash('123456'); // Buraya kendi parolanızı yazın

//$2b$10$wHFO4HHBFAGM1834vfPn2eDRgiMc2LjlzOp3/RcFj1GaTgzDueJIm