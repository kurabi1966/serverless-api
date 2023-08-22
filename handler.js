"use strict";
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({ region: "eu-central-1" });
const { uuid } = require("uuidv4");
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

module.exports.createNote = async (event, context, callback) => {
  const { title, content } = JSON.parse(event.body);
  const notesId = uuid();
  try {
    var params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId,
        title,
        content,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    };
    await documentClient.put(params).promise();
    callback(null, {
      statusCode: 201,
      body: JSON.stringify(params.Item),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }
};
module.exports.updateNote = async (event, context, callback) => {
  const { id } = event.pathParameters;
  const { title, content } = JSON.parse(event.body);
  const UpdateExpression = `set ${title ? "#title = :title, " : ""}${
    title ? "#content = :content" : ""
  }`;
  try {
    var params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId: id },
      UpdateExpression,
      ExpressionAttributeNames: {
        "#title": "title",
        "#content": "content",
      },
      ExpressionAttributeValues: {
        ":title": title,
        ":content": content,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };
    await documentClient.update(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(params),
    });
  } catch (error) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify(error.message),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(`Note with id ${id} has been updated`),
  };
};

module.exports.getNote = async (event) => {
  const { id } = event.pathParameters;
  return {
    statusCode: 200,
    body: JSON.stringify(`Note with id ${id}`),
  };
};

module.exports.getAllNotes = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify([`Note 1`, `Note 2`]),
  };
};

module.exports.deleteNote = async (event) => {
  const { id } = event.pathParameters;
  return {
    statusCode: 200,
    body: JSON.stringify(`Note with id$ {id} has been deleted`),
  };
};
