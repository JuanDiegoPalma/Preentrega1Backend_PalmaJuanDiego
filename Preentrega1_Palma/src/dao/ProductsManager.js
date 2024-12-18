import fs from "fs"
export class ProductManager{
    static #path=""

    static setPath(rutaArchivo=""){
        this.#path=rutaArchivo
    }

    static async getProducts(){
        if(fs.existsSync(this.#path)){
            return JSON.parse(await fs.promises.readFile(this.#path, {encoding:"utf-8"}))
        }else{
            return []
        }
    }

    static async getProductsById(id){
        let products=await this.getProducts()
        let product=products.find(p=>p.id===id)
        return product
    }

    static async getProductsByTitle(title){
        let products=await this.getProducts()
        let product=products.find(p=>p.title.toLowerCase()===title.trim().toLowerCase())
        return product
    }

    static async createProduct(product={}){
        let products=await this.getProducts()
        let id=1
        if(products.length>0){
            id=Math.max(...products.map(p=>p.id))+1
        }
        let nuevoProduct={
            id,
            ...product
        }
        products.push(nuevoProduct)

        await this.#grabaArchivo(JSON.stringify(products, null, 5))

        return nuevoProduct
    }

    static async modificaProducto(id, modificaciones={}){
        let products=await this.getProducts()
        let indiceProducto=products.findIndex(p=>p.id===id)
        if(indiceProducto===-1){
            throw new Error(`Producto inexistente con id ${id}`)
        }

        products[indiceProducto]={
            ...products[indiceProducto],
            ...modificaciones,
            id
        }

        await this.#grabaArchivo(JSON.stringify(products, null, 5))
        return products[indiceProducto]
    }

    static async #grabaArchivo(datos=""){
        if(typeof datos!="string"){
            throw new Error(`error método grabaArchivo - argumento con formato inválido`)
        }
        await fs.promises.writeFile(this.#path, datos)
    }

}