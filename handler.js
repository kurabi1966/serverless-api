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
    callback(null, send(201, params.Item));
  } catch (error) {
    callback(null, send(500, error.message));
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
    callback(
      null,
      send(200, `Note with id ${id} has been updated successfully`)
    );
  } catch (error) {
    callback(null, send(500, error.message));
  }
};

module.exports.getNote = async (event) => {
  const { id } = event.pathParameters;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: id,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };
    const note = await documentClient.get(params).promise();
    callback(null, send(200, note));
  } catch (error) {
    callback(null, send(500, error.message));
  }
};

module.exports.deleteNote = async (event, context, callback) => {
  const { id } = event.pathParameters;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: id,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };
    await documentClient.delete(params).promise();
    callback(
      null,
      send(200, `Note with id ${id} has been deleted successfully`)
    );
  } catch (error) {
    callback(null, send(500, error.message));
  }
  return {
    statusCode: 200,
    body: JSON.stringify(`Note with id$ {id} has been deleted`),
  };
};

module.exports.getAllNotes = async (event) => {
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };
    const notes = await documentClient.scan(params).promise();
    callback(null, send(200, notes));
  } catch (error) {
    callback(null, send(500, error.message));
  }
};

const send = (status, data) => {
  return {
    status,
    body: JSON.stringify(data),
  };
};
