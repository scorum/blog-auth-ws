async function cleanDb(connection) {
  return connection.dropDatabase();
}

module.exports = {
  cleanDb
};
