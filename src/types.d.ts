import { Connection, NullExpression } from "mongoose"

declare global{
    var mongoose:{
        conn:Connection | null,
        promise:Promise<Connection> |NullExpression

    }
}
export {}