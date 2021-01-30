const Modal = {
    //abrir o Modal adicionando a classe active nele
    abrir() {
        document.querySelector('.modal-overlay').classList.add('active')
    },
    //fechar o Modal removendo a classe active nele
    fechar() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []

    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))

    }
}

/*
    Esse objeto Transaction contem elementos que estão responsaveis pela logica de
    entrada e saída de valores da aplicação e soma do total
*/
const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        // Aqui essa função está passando por cada elemento do array transactions e verificando
        // se ele é POSITIVO, se for ele soma na variavel income e a função retorna essa variavel
        // no final, assim tenho o valor total de entradas
        let income = 0
        
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        // Aqui essa função está passando por cada elemento do array transaction e verificando
        // se ele é NEGATIVO, se ele for, soma na variavel expense e a função retorna essa variavel
        // no final, assim tenho o valor total das saidas
        let expense = 0

        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense
    },

    total() {
        // Aqui essa função soma as somas das entradas e saidas e me da o valor total
        return Transaction.incomes() + Transaction.expenses() 
    }

}
/*
    Esse objeto DOM contem elementos que estão responsaveis em mostrar no navegador o resultado
    da logica aplicada 
*/
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
                <td class="description">${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td>
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
                </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

/*
    Esse objeto Utils contem um metodo responsalvel por formatar visualmente os valores para 
    serem vistos como moeda, adicionando o R$ e o sinal
*/
const Utils = {
    formatDate(date) {
        const splittedDate = date.split("-") // o metodo split() está separando a data separada por "-" e colocando em um array
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]} ` // retorno a data já formatada so que separada por "/"
    },

    formatAmount(value){
        value = Number(value) * 100

        return value
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

/*
    Esse objeto Form contem elementos responsaveis por adicionar, formatar e exibir 
    as transações que o usuario fizer pelo formulario
*/
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Por favor, preencha todos os campos')
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)


        return {
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""

    },

    submit(event) {
        event.preventDefault()

        try {
            // verificar se todas as informações foram preenchidas
            Form.validateFields()
            
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            
            // salvar e atualizar
            Transaction.add(transaction)

            // apagar os dados do formulario
            Form.clearFields()

            // fechar o modal
            Modal.fechar()
        } catch (error) {
            alert(error.message)

        }

    }
}


/*
    Responsavel por inicializar a aplicação e fazer os reloads necessarios
*/
const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()