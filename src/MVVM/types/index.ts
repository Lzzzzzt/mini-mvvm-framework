export interface Data {
    [prop: string]: Data | any
}

export type Methods = Data

export interface Options {
    data: Data
    el: string
    methods?: Methods
}
