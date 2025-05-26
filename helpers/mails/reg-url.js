const { PROJECT_DEV_REG_URLS, PROJECT_PROD_REG_URLS } = require('../../constants');

function getRegUrl(project) {
  return process.env.NODE_ENV === 'dev' ? PROJECT_DEV_REG_URLS[project] : PROJECT_PROD_REG_URLS[project];
}

module.exports = {
  getRegUrl
};
