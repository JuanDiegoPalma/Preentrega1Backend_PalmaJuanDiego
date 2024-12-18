import { Router } from "express";
import { ProductManager } from "../dao/ProductsManager.js";
import { errores } from "../utilidades.js";

export const router = Router()

ProductManager.setPath("./src/data/products.json")

router.get("/", async (req, res) => {

    try {
        let products = await ProductManager.getProducts()

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ products });
    } catch (error) {
        errores(res, error)
    }

})

router.get("/:id", async (req, res) => {
    let { id } = req.params
    id = Number(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Proporcione un id numérico` })
    }

    try {
        let product = await ProductManager.getProductsById(id)
        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `No existe producto con id ${id}` })
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ product });
    } catch (error) {
        errores(res, error)
    }
})

router.post("/", async(req, res) => {

    let {title, ...otros}=req.body
    if(!title){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`title es requerido`})
    }
    try {

        let existe=await ProductManager.getProductsByTitle(title)
        if(existe){
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`Existe ${title} en DB`})
        }

        let nuevoProduct=await ProductManager.createProduct({title, ...otros})

        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({ payload: `Se dio de alta con exito!`, nuevoProduct});
    } catch (error) {
        errores(res, error)
    }


})

router.put("/:id", async(req, res) => {
    let { id } = req.params
    id = Number(id)
    if (isNaN(id)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Proporcione un id numérico` })
    }

    let aModificar=req.body
    if(aModificar.id){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error:`No esta permitido modificar id`})
    }
    try {
        if(aModificar.title){
            let products=await ProductManager.getProducts()
            let existe=products.find(p=>p.title.toLowerCase()===aModificar.title.trim().toLowerCase() && p.id!=id)
            if(existe){
                res.setHeader('Content-Type','application/json');
                return res.status(400).json({error:`Ya existe un producto con title ${aModificar.title} en DB. Tiene id ${existe.id}`})
            }
        }
        
        let productoModificado=await ProductManager.modificaProducto(id, aModificar)
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: `Se modifico el procducto con id ${id}`, productoModificado });
    } catch (error) {
        errores(res, error)
    }

})

router.delete("/:pid", async(req, res) => {
    let products=await ProductManager.getProducts()
if(products.length===0){
    res.setHeader('Content-Type','application/json');
    return res.status(400).json({error: `No hay productos a eliminar`})
}
try {
    let {pid}=req.params
    let id=Number(pid)
    if(isNaN(id)){
    res.setHeader('Content-Type','application/json');
    return res.status(400).json({error: `Indique un id numérico`})
}

if(id<1 || id>products.length){
    res.setHeader('Content-Type','application/json');
    return res.status(400).json({error: `La posicion debe estar entre 1 y ${products.length}`})
}

let productEliminado=products[id-1]
products.splice(id-1, 1)

res.setHeader('Content-Type', 'application/json');
return res.status(200).json({ payload: `Producto eliminado`, productEliminado, products});

} catch (error) {
    errores(res, error)
}


})