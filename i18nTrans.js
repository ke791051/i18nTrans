class I18nTrans {
  constructor () {
    this.storage = {}
  }
  /**
   * 
   * @param key It will got the data from storage by key
   */
  t (key) {
    // When storage is empty, console line will show something, and exit the function
    if (Object.getOwnPropertyNames(this.storage).length === 0) {
      console.warn('The language storage is empty, please call init() first, and check your json file is existing')
      return false
    }
    const lang = this.storage.defaultLanguage
    const keyItem = key.split('.')
    // Call the getObjectValue function to get the data
    const value = this.getObjectValue(this.storage.Libary[lang], keyItem)
    return value
  }

  /**
   * 
   * @param Lang Language list, must be array or string type
   * @param defaultLang Default language, if it got undefined, the default language must be first item in Language list   
   * @param space Set namespace just be an identification, same as the file name, must be array or string type
   * @param defaultSpace  Default space, if it got undefined, the default space must be first item in space list   
   * @param loadPath It can set different path for all of file, and this length must be same as space list length
   * @param defaultPath If it don't get path for files, set a path as a root, and it wiil get new file path for every files
   * @param loadAll Set true,it will load all of language in language list when call this function
   */
  async init ({ lang = [],
    defaultLang = undefined,
    space = [],
    defaultSpace = undefined,
    loadPath = [],
    defaultPath = '',
    loadAll = true } = {}) {
    // Making some temp data, it will be use in this function
    let tmpLanguage = []
    let tmpDefaultLanguage = ''
    let tmpSpace = []
    let tmpDefaultSpace = ''
    let tmpLoadPath = []
    let tmpLoadAll = true
    const tmpLibary = {}

    // set default setting
    // When lang got string type, it wiil be pass to an new array
    if (typeof lang === 'string') {
      tmpLanguage.push(lang)
    } else if (typeof lang === 'object') {
      tmpLanguage = lang
    }
    // When it not defaultLang undefined, the default language must be first item in Language list   
    if (defaultLang === undefined) {
      tmpDefaultLanguage = tmpLanguage[0]
    } else {
      tmpDefaultLanguage = defaultLang
    }
    // When space got string type, it wiil be pass to an new array
    if (typeof space === 'string') {
      tmpSpace.push(space)
    } else if (typeof space === 'object') {
      tmpSpace = space
    }
    // When it not defaultSpace undefined, the default space must be first item in space list   
    if (defaultSpace === undefined) {
      tmpDefaultSpace = tmpSpace[0]
    } else {
      tmpDefaultSpace = defaultSpace
    }

    tmpLoadAll = loadAll
    // When it go an empty loadPath, it will make up an new path by default path and namespace
    if (loadPath.length === 0 || loadPath.length !== tmpSpace.length) {
      console.warn('The parameter path is missing, the file will be load by space and default path ')
      tmpLoadPath = tmpSpace.map((data, index) => {
        return defaultPath.replace(':space', data)
      })
    } else if (typeof space === 'object') {
      tmpLoadPath = loadPath
    }
    // Set the languages and it will be load by this array, when tmpLoadAll is false, it will load only one language, same as default language
    let reLoadLang = []
    if (tmpLoadAll) {
      reLoadLang = tmpLanguage
    } else {
      reLoadLang.push(tmpDefaultLanguage)
    }
    // Make a new promise
    return new Promise((resolve, reject) => {
      // ForEach in reLoadLang array
      reLoadLang.forEach((l) => {
        const langLibary = {}
        // ForEach in tmpLoadPath array
        tmpLoadPath.forEach(async (Url, index) => {
          // ReBuild the path with reLoadLang and tmpLoadPath
          const load = new Request(Url.replace(':lang', l), { method: 'GET', cache: 'reload' })
          let jsonData = ''
          // Await function and fetch some data from path 
          await fetch(load, { method: 'get' }).then((data) => {
            // When fetch success 
            if (data.ok) {
              // Get the json data
              data.json().then((json) => {
                jsonData = json
                resolve(jsonData)
              })
            // When fetch failed 
            } else {
              reject(new Error(`status: ${data.status} statusText: ${data.statusText}`))
            }
          })
          const result = {}
          result[tmpSpace[index]] = jsonData
          Object.assign(langLibary, result)
        })
        tmpLibary[l] = langLibary
      })
      // Save in storage
      this.storage = {
        Language: tmpLanguage,
        defaultLanguage: tmpDefaultLanguage,
        space: tmpSpace,
        defaultSpace: tmpDefaultSpace,
        loadPath: tmpLoadPath,
        LoadAll: tmpLoadAll,
        Libary: tmpLibary
      }
    })
  }

  async import (lang = [],
    space = [],
    loadPath = []) {
    const tmpLibary = {}

    if (Object.getOwnPropertyNames(this.storage).length === 0) {
      console.warn('The language storage is empty, please call init() first, and check your json file is existing')
      return false
    }
    // Make a new promise
    return new Promise(async (resolve, reject) => {
      // ReBuild the path with reLoadLang and tmpLoadPath
      const load = new Request(loadPath.replace(':lang', lang), { method: 'GET', cache: 'reload' })
      let jsonData = ''
      // Await function and fetch some data from path 
      await fetch(load, { method: 'get' }).then((data) => {
        // When fetch success 
        if (data.ok) {
          // Get the json data
          data.json().then((json) => {
            console.log(json)
            jsonData = json
            resolve(jsonData)
          })
          // When fetch failed 
        } else {
          reject(new Error(`status: ${data.status} statusText: ${data.statusText}`))
        }
      })
      tmpLibary[lang] = jsonData
      if (this.storage.Libary[lang] === undefined) {
        Object.assign(this.storage.Libary, tmpLibary)
        return false
      }
      if (this.storage.Libary[lang][space] === undefined) {
        Object.assign(this.storage.Libary[lang], jsonData)
      } else {
        this.storage.Libary[lang] = jsonData
      }
      return false
    })
  }

  /**
   * 
   * @param obj An library, and it will get the translate data from this
   * @param keyItem It will got the data from storage by keyitem
   */
  getObjectValue (obj, keyItem) {
    if (typeof obj === 'object') {
      const key = keyItem.shift()
      return this.getObjectValue(obj[key], keyItem)
    }
    return obj
  }
}

// New a i18nTrans object and export it
const i18nTrans = new I18nTrans()
export default i18nTrans

