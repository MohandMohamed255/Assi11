import { redis_client } from "./connection.redis.js";

export const setValue=async({key,value,ttl} = {})=>{
    try {
        value= typeof value == "string"? value : JSON.stringify(value)
        ttl ?
        await redis_client.set(key,value,{EX:ttl}):
        await redis_client.set(key,value)
    } catch (error) {
        console.log(error,"\nredis setValue faild");
        
    }
}
export const update_keyredis=async({key,value,ttl} = {})=>{
    try {
        if(!await redis_client.exists(key)){
            return 0
        }
        await redis_client.set(key,value,{EX:ttl})
    
    } catch (error) {
        console.log(error,"\nredis updateValue faild");
        
    }
}
export const getvalue=async(key)=>{
    try {
        try {
            return JSON.parse(await redis_client.get(key))
        } catch (error) {
            return await redis_client.get(key)
        }
    } catch (error) {
        console.log(error,"\nredis get faild");
        
    }
}
export const ttl=async(key)=>{

    try {
       return await redis_client.ttl(key)
    } catch (error) {
        console.log(error,"\nredis ttl faild");
        
    }
}
export const exists=async(key)=>{

    try {
       return await redis_client.exists(key)
    } catch (error) {
        console.log(error,"\nredis exists faild");
        
    }
}
export const expire=async(key,ttl)=>{

    try {
       return await redis_client.expire(key,ttl)
    } catch (error) {
        console.log(error,"\nredis expire faild");
        
    }
}
export const deleteKey=async(key)=>{

    try {
        if(!key?.length) return 0
       return await redis_client.del(key)
    } catch (error) {
        console.log(error,"\nredis delete faild");
        
    }
}
export const Keys=async(key)=>{

    try {
       return await redis_client.keys(`${key}*`)
    } catch (error) {
        console.log(error,"\nredis get keys faild");
        
    }
}
export const incr=async(key)=>{

    try {
       return await redis_client.incr(key)
    } catch (error) {
        console.log(error,"\nredis get keys faild");
        
    }
}

