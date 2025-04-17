const { execSync } = require("child_process");

const checkPackage = (pkg) => {
  try {
    const output = execSync(`npm list ${pkg}`).toString();
    if (output.includes(pkg)) {
      console.log(`✔ ${pkg} is installed.`);
    } else {
      throw new Error();
    }
  } catch {
    console.log(`✘ ${pkg} is NOT installed.`);
  }
};

["express", "mustache", "gray-nedb", "nodemon"].forEach(checkPackage);

