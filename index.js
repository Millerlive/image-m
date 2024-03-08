const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
// 上传图片使用插件
const multer = require("multer");

const router = express.Router();
const app = express();

// 跨域
app.use(cors());

// 静态资源目录  (如果在本地访问需要设置)
app.use(express.static(__dirname + '/static'))

// 上传的图片保存的路径
const fullPath = path.resolve(__dirname, "./static");

// 连接mongodb数据库 MongoDB connection
mongoose.connect(
  "mongodb+srv://pro-3-6:pro-3-6@cluster0.6ylglz3.mongodb.net/images"
);

// 开启数据库服务
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

// 创建image文档结构对象  Image schema and model
const imageSchema = new mongoose.Schema({
  filedname: String,
  filename: String,
  size: Number,
  mimetype: String,
});

// 创建文档模型对象
const imageModel = mongoose.model("Image", imageSchema);

/* 
destination: 必需参数，用于指定上传的文件应该存储在哪个目录下面。它可以是一个字符串（表示文件夹的路径）
或者一个函数（用于动态计算存储的目录）。当设置为一个字符串时，如果目录不存在，Multer会尝试自动创建这个目录；
而当设置为一个函数时，你可以根据请求中的数据（如文件类型、上传用户等）等来计算存储目录。
*/
// 配置，可修改存储的名称以及存储位置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    /* 
        file 参数：代表上传的文件。它是一个包含以下属性的对象：

            fieldname: 表示上传字段的名称。
            originalname: 表示上传文件的原始文件名。
            encoding: 表示上传文件的编码方式。
            mimetype: 表示上传文件的 MIME 类型。
            size: 表示上传文件的大小（单位为字节）。
            destination: 表示文件存储时的目标目录。
            filename: 表示文件存储时的文件名。
    */
    console.log("destination", file);
    //cb 函数：cb 是一个回调函数，用于告知 Multer 文件的存储目标路径。它需要在函数中被调用来指定文件应该存储的目录。
    // 将 null 或错误信息作为第一个参数传递给 cb，并将目标目录作为第二个参数传递给 cb。
    cb(null, fullPath);
    // cb(null, './static')
  },
  // 图片名称
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
  /* 
  filename: 必需参数，在存储上传文件时，用于指定上传的文件在磁盘上的名称。它可以是一个字符串（表示文件名）
  或者一个函数（用于动态计算文件名）。当设置为一个字符串时，它将会作为文件的固定名称保存；
  而当设置为一个函数时，你可以根据请求中的数据（如文件类型、上传用户等）等来计算文件名。
  */
});
//
const fileUpload = multer({ storage: storage });

// 1、上传单张
//  应用 Multer 中间件函数到路由中  上传的文件对象的字段名为 “avatar” （fieldname  要和发送请求时表单name属性值保持一致）
router.post("/upload", fileUpload.single("avatar"), async (req, res) => {
  console.log("req.file", req.file);

  // const { fieldname, filename, size, mimetype } = req.file
  // const newImage = new imageModel({
  //     filedname: fieldname,
  //     filename: filename,
  //     size: size,
  //     mimetype: mimetype
  // });
  // await newImage.save();

  // 或以下方式
  imageModel
    .create(req.file)
    .then((res) => {
      console.log("插入数据成功");
    })
    .catch((err) => {
      console.log("插入数据失败");
    });
  console.log(req.files);
  res.status(200).send("Image uploaded successfully");
});

// 2、上传多个文件 array  multer(options).array(filename,[maxCount])
router.post("/uploadMultiple", fileUpload.array("photo", 3), (req, res) => {
  console.log('上传成功', req.files);
  imageModel
    .insertMany(req.files)
    .then((res) => {
      console.log("插入数据成功");
    })
    .catch((err) => {
      console.log("插入数据失败");
    });
  console.log(req.files);
});

// client 请求返回图片
router.get("/static", async (req, res) => {
  const data = await imageModel.find();
  console.log(data);
  res.send(data);
  // res.send('aaa')
});

app.use(router);

app.listen("8001", () => {
  console.log("serve is running...");
});
