class Slider extends React.Component {
    constructor(props) {
        super(props);
        const { value, filter, onChange } = this.props;

        this.state = {
            range: filter,
            min: value[0],
            max: value[1],
            value: value
        }

        this.onChange = onChange.bind(this);
        this.changeValue = this.changeValue.bind(this);
    }

    changeValue = (e, val) => {
        this.props.onChange(e, val); // Updates MainDisplay filter.
        this.setState({ value: val }); // Updates Slider display.
    };

    render() {
        const { Slider } = window['MaterialUI'];

        return (
            <div className='mlr-5'>
                <Slider
                    getAriaLabel={() => 'Price range'}
                    min={this.state.min}
                    max={this.state.max}
                    value={this.state.value}
                    onChange={this.changeValue}
                    valueLabelDisplay="auto"
                />
            </div>
        )
    }
}

class SideBar extends React.Component {
    constructor(props) {
        super(props);
        const { products } = this.props;
        const categories = products.map((p) => p.category);
        const uniqueCategories = [... new Set(categories)];
        const filteredProducts = products.filter((p) => uniqueCategories.includes(p.category));
        const value = [...filteredProducts.map(p => p.price)];
        const sortedVals = value.sort((a, b) => a - b);
        const min = sortedVals[0];
        const max = sortedVals.length > 0 ? sortedVals[sortedVals.length - 1] : 0; // Get last value.

        this.state = {
            selectedCategories: uniqueCategories,
            uniqueCategories: uniqueCategories,
            filteredProducts: filteredProducts,
            priceRange: [min, max],
            value: [min,max]
        };
    }
  
    capitalizeWords = (str) => {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    handleCategoryClick = (event) => {
        const clickedCategory = event.target.value;
        const isChecked = event.target.checked;
    
        // Update state to reflect filtered products.
        this.setState((prevState) => {
            let updatedSelectedCategories;
            if (isChecked) {
                updatedSelectedCategories = [...prevState.selectedCategories, clickedCategory];
            } else {
                updatedSelectedCategories = prevState.selectedCategories.filter((category) => category !== clickedCategory);
            }
            return { selectedCategories: updatedSelectedCategories };
        });
    };

    handlePriceChange = (e, priceRange) => {
        this.setState({ priceRange });
    };

    render() {
        const { selectedCategories, uniqueCategories, filteredProducts, priceRange, value } = this.state;

        // Reduce list to only unique categories. 
        const categoryItems = uniqueCategories.map(category => {
            return (<li key={category}>
                <label>
                    <input 
                        type="checkbox" value={category} 
                        checked={selectedCategories.includes(category)} 
                        onChange={this.handleCategoryClick} 
                    />
                    {this.capitalizeWords(category)}
                </label>
            </li>)
        });

        const displayProducts = filteredProducts.filter(p => selectedCategories.includes(p.category)); // Only show selected Categories.

        return (
            <div className='container'>
                <div className="sidebar">
                    <h2>Categories</h2>
                    <ul id='prod-filters' className='prod-filters'>{categoryItems}</ul>
                    <h2>Price</h2>
                    <Slider value={value} filter={priceRange} onChange={this.handlePriceChange}/>
                </div>
                <MainDisplay filteredProducts={displayProducts} priceRange={priceRange}/>
            </div>
        );
    }
}
 
class MainDisplay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {   
        const { filteredProducts, priceRange } = this.props;
        const priceFiltered = filteredProducts ? filteredProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]) : [];

        const items = priceFiltered.map(p => {
            return (
                <div key={p.title} className='card-container'>
                    <div className='card'>
                        <img className='prod-img' src={p.image}></img>
                        <div className='prod-details'>
                            <div className='prod-title'>
                                <h3 className='mlr-5'>{p.title}</h3>
                            </div>
                            <div className='prod-info'>
                                <p className='mlr-5'>{p.description}</p>
                                <h5 className='mlr-5'>List Price: ${p.price}</h5>
                                <h6 className='mlr-5'>Rating: {p.rating.rate} ({p.rating.count} Reviews)</h6>
                            </div>
                        </div>
                    </div>
                </div>
            )
        });

        return (
            <div className='container main-display'>{items}</div>            
        ) 
    }
 }

 class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            products: []
        }
    }

    // Get products from API.
    getProducts() {
        return fetch('https://fakestoreapi.com/products')
            .then(res=>res.json());
    }

    async componentDidMount() {
        this.setState({products: await this.getProducts()});
        console.log(this.state.products);
    }

    render() {
        const { products } = this.state;

        return (
            <div className='container'>
                {
                    products.length ? (
                        <div className='container'>
                            <SideBar products={products}/>
                        </div>    
                    ) : (
                        <div className='container'>Loading...</div>
                    )
                }
                
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));