var express = require('express');
const pool = require("../../models/bd");
var router = express.Router();
var novedadesModel = require("../../models/novedadesModel");
var cloudinary = require("cloudinary").v2;
var util = require("util");

var uploader = util.promisify(cloudinary.uploader.upload);

/* GET home page. */
router.get('/', async function (req, res, next) {

    var novedades = await novedadesModel.getNovedades();

    res.render('admin/novedades', {
        layout: "admin/layout",
        usuario: req.session.nombre,
        novedades
    });
});

/*Para eliminar un novedad*/
router.get("/eliminar/:id", async (req, res, next) => {
    var id = req.params.id;
    await novedadesModel.deleteNovedadesById(id);
    res.redirect("/admin/novedades")

}); //cierra get de eliminar

/*formulario para agregar las novedades */

router.get("/agregar", (req, res, next) => {
    res.render("admin/agregar", {
        layout: "admin/layout"
    })
});

/*agregar cuando toco el boton guardar */

router.post("/agregar", async (req, res, next) => {

    console.log(req.body)

    try {


        var img_id = "";
        if (req.files && Object.keys(req.files).length > 0) {
            imagen = req.files.imagen;
            img_id = (await uploader(imagen.temFilePath)).access_control.
                public_id;
        }




        if (req.body.titulo != "" && req.body.subtitulo != "" && req.body.cuerpo != "") {
            await novedadesModel.insertNovedad({
                ...req.body,
                img_id
            });
            res.redirect("/admin/novedades")
        } else {
            res.render("admin/agregar", {
                layout: "admin/layout",
                erro: true,
                message: "Todos los campos son requerido"

            })
        }

    } catch (erro) {
        console.log(erro)
        res.render("admin/agregar", {
            layout: "admin/layout",
            error: true,
            message: "No se cargo la novedad"
        })
    }
})

/*modificar la novedad*/

router.get("/modificar/id:", async (req, res, next) => {
    var id = req.params.id;
    var novedad = await novedadesModel.getNovedadById(id);
    res.render("admin/modificar", {
        layout: "admin/layou",
        novedad
    });
}); //cierro get modificar

router.post("/modificar", async (req, res, next) => {
    try {

        var obj = {
            titulo: req.body.titulo,
            subtitulo: req.body.subtitulo,
            cuerpo: req.body.cuerpo
        }

        console.log(obj) //para ver si trae los datos
        await novedadesModel.modificarNovedadById(obj, req.body.id);
        res.redirect("/admin/novedades");
    } catch (error) {
        console.log(error)
        res.render("admin/modificar", {
            layout: "admin/layout",
            error: true,
            message: "No se modifico la novedad"
        })
    }
});


module.exports = router;