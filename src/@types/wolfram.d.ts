// https://github.com/theGordHoard/hoardbot/blob/master/src/%40types/wolfram.d.ts
// Copyright Katlyn Lorimer, All Rights Reserved
// Used with permission from Katlyn Lorimer

declare module 'wolfram' {
  export interface WolframResponse {
    queryresult: QueryResult
  }

  export interface QueryResult {
    success: boolean
    error: boolean|{ code: string, msg: string }
    numpods: number
    datatypes: string
    timedout: string
    timedoutpods: string
    timing: number
    parsetiming: number
    parsetimedout: boolean
    recalculate: string
    id: string
    host: string
    server: string
    related: string
    version: string
    pods: Pod[]
    assumptions: Assumptions
    didyoumeans?: DidYouMeans
  }

  export interface Pod {
    title: string
    scanner: string
    id: string
    position: number
    error: boolean
    numsubpods: number
    subpods: Subpod[]
    expressiontypes: { name: string }
  }

  export interface Subpod {
    title: string
    img: Image
    plaintext: string
  }

  export interface Image {
    src: string
    alt: string
    title: string
    width: number
    height: number
    type: string
    themes: string
    colorinvertable: boolean
  }

  export interface Assumptions {
    type: string
    word: string
    template: string
    count: number
    values: AssumptionValue[]
  }

  export interface AssumptionValue {
    name: string
    desc: string
    input: string
  }

  export interface DidYouMeans {
    score: string
    level: string
    val: string
  }
}
