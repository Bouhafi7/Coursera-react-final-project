import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const departments = [
    { dep: 'Marketing' },
    { dep: 'Finance' },
    { dep: 'Sales' },
    { dep: 'Human Resources' },
    { dep: 'IT' },
  ];

  const currencies = [
    { curr: 'Dollar', symbol: '$', Pound: 0.78540286, Euro: 0.91947461, Ruppee: 83.148866 },
    { curr: 'Pound', symbol: '£', Dollar: 1.2732319, Euro: 1.1707044, Ruppee: 105.86779 },
    { curr: 'Euro', symbol: '€', Dollar: 1.0875776, Pound: 0.85418657, Ruppee: 90.430846 },
    { curr: 'Ruppee', symbol: '₹', Dollar: 0.012026622, Pound: 0.0094457435, Euro: 0.011058174 },
  ];

  const [allDepartments, setAllDepartments] = useState(JSON.parse(localStorage.getItem('companyData')) || []);
  const [budget, setBudget] = useState(localStorage.getItem('budget') || '');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || currencies[0].symbol);
  const [department, setDepartment] = useState('');
  const [operation, setOperation] = useState('');
  const [allocation, setAllocation] = useState('');
  // const [currValue, setCurrValue] = useState(localStorage.getItem('currValue') || 1);


  const [spent, setSpent] = useState(allDepartments.reduce((total, dep) => total + dep.budget, 0) || 0);
  const [remaining, setRemaining] = useState(budget - spent || 0);
  const filteredDeps = allDepartments.filter(company => company.budget !== 0);
  
  // badget input must be greater than allocation
  const handleBudget = (value) => {
    if (value >= spent) {
      setBudget(value);
      setRemaining(value - spent);
      localStorage.setItem('budget', value);
    } else alert('Budget cannot be less than spent');
  };
  
  // change the current and budget 
  const handleCurrency = (value) => {
    setCurrency(value);
    localStorage.setItem('currency', value);
  };

  const handleAllocation = () => {
    if (budget) {
      if (!department) {
        alert('Please choose a department..!');
        return;
      }
      if (!allocation) {
        alert('Please enter an allocation value..!');
        return;
      }

      if (preventBudget()) {
        setAllDepartments(prev => {
          // add the budget if the department doesn't exists
          const depIndex = prev.findIndex(company => company.dep === department);
          if (depIndex === -1) {
            if (operation === 'add') {
              // add a department just if it greater than allocation
              if (budget < allocation) {
                alert('The allocation must be lower than or equal to the Budget..!');
                return [...prev];
              } else return [...prev, { dep: department, budget: parseInt(allocation) }];
              // to make sure the user choosed add option if he wants to add a department
            } else if ((operation === 'substract' && allDepartments.length === 0) || allDepartments.length > 0) {
              alert('Choose the add option..!');
              return [...prev];
            }
          } else {
            // increase the budget if the department already exists
            return prev.map(company => {
              if (company.dep === department) {
                if (operation === 'add') {
                  return { ...company, budget: parseInt(company.budget) + parseInt(allocation) };
                }
                if (operation === 'substract') {
                  return { ...company, budget: parseInt(company.budget) - parseInt(allocation) };
                }
              }
              return company;
            });
          }
        });
      }
    } else {
      alert('You need a budget first..!');
    }
  };

  // prevent adding an allocation if it's gretaer than the spent
  const preventBudget = () => {
    if (operation === 'add' && spent + parseInt(allocation) > budget) {
      alert('Allocations exceed the budget. Please allocate a lower amount.');
      return false;
    }
    return true;
  };
  
  // store all changes in local storage
  useEffect(() => {
    localStorage.setItem('companyData', JSON.stringify(allDepartments));
    const newSpent = allDepartments.reduce((total, dep) => total + dep.budget, 0);
    setSpent(newSpent);
    setRemaining(budget - newSpent);
  }, [allDepartments]);

  // increase and decrease the department's budget
  const handleBudgetByTen = (value, i) => {
    setAllDepartments(prev => {
      return prev.map((company, idx) => {
        if (idx === i) {
          const updatedBudget = value === '+' ? parseInt(company.budget) + 10 : parseInt(company.budget) - 10;
  
          if (value === '-' || (value === '+' && spent < budget)) {
            if (value === '+' && remaining < 10) {
              alert("You don't have enough remaining budget to decrease by 10.");
              return { ...company };
            }
            return { ...company, budget: updatedBudget };
          } else if (value === '+' && spent >= budget) {
            alert("You've reached the max allocation.");
            return { ...company };
          }
        }
        return company;
      });
    });
  };
  

  // remove a department
  const removeDep = (idx) => {
    const depsLeft = filteredDeps.filter((_, i) => idx !== i);
    setAllDepartments(depsLeft);
  };

  const convertCurrency = (value, prevCurr, newCurr) => {
    return Math.round(value * prevCurr[newCurr]);
  };

  //handle currencies change
  const handleCurrChange = (symbol) => {
    const prevCurr = currencies.find(curr => curr.symbol === currency);
    const newCurr = currencies.find(curr => curr.symbol === symbol);
    if (prevCurr) {
      const updatedBudget = convertCurrency(budget, prevCurr, newCurr.curr);
      const updatedDepartments = allDepartments.map(dep => ({ ...dep, budget: convertCurrency(dep.budget, prevCurr, newCurr.curr) }));
      setBudget(updatedBudget);
      setAllDepartments(updatedDepartments);
      localStorage.setItem('budget', updatedBudget);
    }
  };


  return (
    <div className="container">
      <h1>Company's Budget Allocation</h1>
      <div className="head">
        <div className='budget'>
          <label htmlFor="">Budget: </label>
          <span>{currency}</span><input type="number" value={budget !== null ? budget : null} onChange={e => handleBudget(e.target.value)} className='budget-input' step='10' />
        </div>
        <div className='remaining'>
          <label htmlFor="">Remaining: </label>
          <p><span>{currency}</span>{remaining}</p>
        </div>
        <div className='spent'>
          <label htmlFor="">Spent so far: </label>
          <p><span>{currency}</span>{spent}</p>
        </div>
        <div className='currency'>
          <select value={currency} onChange={(e) => { handleCurrency(e.target.value); handleCurrChange(e.target.value)}}>
            {currencies.map((el, i) => (
              <option key={i} value={el.symbol} data-value={el.value}>{el.symbol} {el.curr}</option>
            ))}
          </select>
        </div>
      </div>
      <h2>Allocation</h2>
      <table>
        <thead>
          <tr>
            <th>Depatment</th>
            <th>Allocated Budget</th>
            <th>Increase by 10</th>
            <th>Decrease by 10</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredDeps.map((el, i) => (
            <tr key={i}>
              <td>{el.dep}</td>
              <td>{currency}{el.budget}</td>
              <td style={{textAlign: 'center'}}><i className="fa-solid fa-plus" data-operation='+' onClick={(e) => handleBudgetByTen(e.target.getAttribute('data-operation'), i)}></i></td>
              <td style={{textAlign: 'center'}}><i className="fa-solid fa-minus" data-operation='-' onClick={(e) => handleBudgetByTen(e.target.getAttribute('data-operation'), i)}></i></td>
              <td style={{textAlign: 'center'}}><i className="fa-solid fa-xmark" onClick={() => removeDep(i)}></i></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Change Allocation</h2>
      <div className="foot">
        <div>
          <label>Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}>
            <option value="Choose..." style={{display: 'none'}}>Choose...</option>
            {departments.map((el, i) => (
              <option key={i} value={el.dep}>{el.dep}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Allocation</label>
          <select value={operation} onChange={e => setOperation(e.target.value)}>
            <option value="Choose..." style={{display: 'none'}}>Choose...</option>
            <option value='add'>Add</option>
            <option value='substract'>Substract</option>
          </select>
        </div>
        <div>
          <span>{currency}</span>
          <input type="number" value={allocation} onChange={e => setAllocation(e.target.value)}/>
          <button onClick={handleAllocation}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default App;