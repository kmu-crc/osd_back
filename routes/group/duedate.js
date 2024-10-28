const connection = require("../../configs/connection");
const axios = require("axios");
const convert = (rawobj) => JSON.parse(JSON.stringify(rawobj));

exports.getProblemContentList = async (req, res, next) => {

  const getlist = (group_id) => {
    return new Promise((resolve, reject) => {
		  const sql = "SELECT DISTINCT content FROM opendesign.design_content WHERE `type`=\"PROBLEM\" AND card_id IN (SELECT uid FROM opendesign.design_card WHERE design_id IN (SELECT uid FROM opendesign.design D WHERE uid IN (SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id = ? ) AND D.category_level3 IS NOT NULL));";
      connection.query(sql, group_id, (err,row) => { if(!err) { resolve(convert(row)); } else { reject(err); } });
    });
  };

  const success = (data) => { res.status(200).json(data) };
  const error = (e) => { res.status(500).json({ result: null, error: e }) };

  getlist(req.params.id)
   .then(success)
   .catch(error);
};

