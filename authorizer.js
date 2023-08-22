const generatePolicy = (principalId, effect, resource) => {
  let authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {
      Vesrion: '2012-10-17',
      Statement: [
        {
          Effect: effect,
          Resource: resource,
          Action: 'execute-api:Invoke',
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }
  authResponse.context = {
    user: { name: 'Ammar Kurabi', role: 'admin' },
  };
  console.log('--- Debug --->', authResponse);

  return authResponse;
};
module.exports.handler = async (event, context, callback) => {
  // ToDo: Authorized the caller
  const token = event.authorizationToken;
  switch (token) {
    case 'allow':
      callback(null, generatePolicy('user', 'Allow', event.methodArn));
      break;
    case 'deny':
      callback(null, generatePolicy('user', 'Deny', event.methodArn));
      break;
    default:
      callback('Error: Invalid authorization token');
  }
};
