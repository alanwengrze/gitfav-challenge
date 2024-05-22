export class GithubUser{
  static search(username){
    const endpoint = `https://api.github.com/users/${username}`
    return fetch(endpoint)
      .then(data => data.json())
      .then(({login, name, public_repos, followers}) => ({
        login,
        name,
        public_repos,
        followers,
      }))
  }
}

export class Favorites{
  constructor(root){
    this.root = document.querySelector(root)
    this.load()
  }
  load(){
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  async add(username){
    try{

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists){
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }
      this.entries = [user, ...this.entries]

      this.update()
      this.save()
      this.noFavs()
    } catch(error){
      alert(error.message)
    }
    
  }

  save(){
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  delete(user){
    const filteredEntries = this.entries.filter((entry)=>{
      return entry.login !== user.login
    })

    this.entries = filteredEntries

    this.update()
    this.save()
    this.noFavs()
  }
  noFavs(){
    const noFav = this.root.querySelector('.no-fav-wrapper')
    if(this.entries.length <= 0){
      noFav.classList.remove('hide')
    }else{
      noFav.classList.add('hide')
    }
  }
}

export class FavoritesView extends Favorites{
  constructor(root){
    super(root)

    this.tbody = this.root.querySelector("table tbody")
    this.update()
    this.onAdd()
    this.noFavs()
  }

  onAdd(){
    const addButton = this.root.querySelector(".search button")
    addButton.onclick = ()=>{
      const { value } = this.root.querySelector(".search input")
      this.add(value)
      let reset = this.root.querySelector(".search input")
      reset.value = ""
    }
  }

  update(){
    this.removeAll()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user a p').textContent = user.name
      row.querySelector('.user a span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = ()=>{
        const isOk =  confirm('Tem certeza que deseja deletar essa linha?')
        if(isOk){
         this.delete(user)
        }
       }
  
       this.tbody.append(row)
    })   
  }

  createRow(){
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/alanwengrze.png" alt="Imagem de alanwengrze">
        <a href="https://github.com/alanwengrze" target="_blank">
          <p>Alan Wengrze</p>
          <span>alanwengrze</span>
        </a>
      </td>
      <td class="repositories">
        7
      </td>
      <td class="followers">
        5
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>

    `

    return tr
  }
  removeAll(){
    this.tbody.querySelectorAll('tr')
      .forEach((tr)=>{
        tr.remove()
      })
  }

}