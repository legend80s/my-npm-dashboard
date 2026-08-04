import npmPkgs from "npm-pkgs"

npmPkgs("antfu", function _cb(err, res) {
  if (err) {
    console.error(err)
    return
  }
  console.log(res)
  //=> ['list', 'of', 'user', 'packages']
})
