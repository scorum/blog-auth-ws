const { PROJECT_NAMES } = require('../../constants');

async function checkProject(ctx, next) {
  const project = ctx.checkBody('project').value;
  ctx.state.project = project || PROJECT_NAMES.BLOG;
  await next();
}

module.exports = checkProject;
