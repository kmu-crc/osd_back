// 디자인 디테일 정보 등록
exports.forkDesign = async (req, res, next) => {
  let parent = req.params.id;
  let user_id = req.params.user_id;
  let newchild = 99999;
  console.log("forkDesign", parent);
  console.log("new author!", user_id);
  //params: { id: '2992' },
  const respond = () => {
    res.status(200).json({
      success: true,
      new_design_id:2257,// parent, //newchild,
      message: "파생디자인이 성공적으로 등록되었습니다."
    });
  };
  const reject = () => {
    res.status(200).json({
      success: false,
      message: "파생디자인 생성에 실패하였습니다."
    });
  };

  const forkDesign = () => {
        // respond()
        reject()
    console.log("select and insert only! may you need to write file");
  }
  
  // . select parent design
  // . store design
  // . copy new child design from parent design 
  // . update parent design
  // . modify new child deisgn
  // . is_project check and then create createboard, card, 
    


  forkDesign()
};
