let userData = [];
let expenseChart; // Declare a global variable to store the chart instance
let pieChart; // Declare a global variable for the pie chart instance



function finalizeMonthlyBudget() {
  const monthlyBudgetInput = document.getElementById('monthlyBudget');
  const budgetTypeSelect = document.getElementById('budgetTypeSelect');
  const categorySelect = document.getElementById('categorySelect');
  const budgetAmountInput = document.getElementById('budgetAmount');
  const addExpenseButton = document.getElementById('addExpenseButton');

  // Disable the monthly budget input
  monthlyBudgetInput.disabled = true;

  // Enable the budget type, category, and budget amount inputs
  budgetTypeSelect.disabled = false;
  categorySelect.disabled = false;
  budgetAmountInput.disabled = false;

  // Enable the "Add Expense" button
  addExpenseButton.disabled = false;
}


function showCategoryInputs() {
  const selectedCategory = document.getElementById('categorySelect').value;
  const categoryInputsContainer = document.getElementById('categoryInputs');

  // Clear previous inputs
  categoryInputsContainer.innerHTML = '';

  // Add inputs based on the selected category
  switch (selectedCategory) {
    case 'Leisure':
      categoryInputsContainer.innerHTML += '<div class="form-group"><label for="leisureInput">Leisure Activity:</label><input type="text" class="form-control" id="leisureInput" placeholder="Enter activity"></div>';
      break;
    case 'Food':
      categoryInputsContainer.innerHTML += '<div class="form-group"><label for="foodTypeSelect">Food Type:</label><select class="form-control" id="foodTypeSelect"><option value="groceries">Groceries</option><option value="eating_out">Eating Out</option></select></div>';
      break;
    case 'Entertainment':
      categoryInputsContainer.innerHTML += '<div class="form-group"><label for="entertainmentInput">Entertainment Activity:</label><input type="text" class="form-control" id="entertainmentInput" placeholder="Enter activity"></div>';
      break;
    case 'Utilities':
      categoryInputsContainer.innerHTML += '<div class="form-group"><label for="utilitiesTypeSelect">Utilities Type:</label><select class="form-control" id="utilitiesTypeSelect"><option value="electricity">Electricity</option><option value="water">Water</option></select></div>';
      break;
    default:
      break;
  }
}

function addExpense() {
  const category = document.getElementById('categorySelect').value;
  const categorySpecificInput = getCategorySpecificInput();
  const budgetType = document.getElementById('budgetTypeSelect').value;
  const budgetAmount = parseFloat(document.getElementById('budgetAmount').value);

  if (isNaN(budgetAmount) || budgetAmount <= 0) {
    alert('Please enter a valid budget amount.');
    return;
  }

  userData.push({
    category,
    categorySpecificInput,
    budgetType,
    budgetAmount,
  });

  // Update table, chart, and insights
  updateTable();
  updateChart();
  updateInsights();
  recommendBudgetAdjustment();
}

function getCategorySpecificInput() {
  const selectedCategory = document.getElementById('categorySelect').value;

  switch (selectedCategory) {
    case 'Leisure':
      return document.getElementById('leisureInput').value;
    case 'Food':
      return document.getElementById('foodTypeSelect').value;
    case 'Entertainment':
      return document.getElementById('entertainmentInput').value;
    case 'Utilities':
      return document.getElementById('utilitiesTypeSelect').value;
    default:
      return '';
  }
}

function updateTable() {
  const tableBody = document.getElementById('expenseTableBody');
  const newRow = tableBody.insertRow();

  const categoryCell = newRow.insertCell(0);
  const categorySpecificInputCell = newRow.insertCell(1);
  const budgetTypeCell = newRow.insertCell(2);
  const budgetAmountCell = newRow.insertCell(3);

  const latestEntry = userData[userData.length - 1];

  categoryCell.textContent = latestEntry.category;
  categorySpecificInputCell.textContent = latestEntry.categorySpecificInput;
  budgetTypeCell.textContent = latestEntry.budgetType;
  budgetAmountCell.textContent = latestEntry.budgetAmount.toFixed(2);
}

function updateChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');

  // Clear existing chart if it exists
  if (expenseChart) {
    expenseChart.destroy();
  }

  const barChartData = {
    labels: userData.map(item => `${item.category} - ${item.budgetType}`),
    datasets: [{
      label: 'Budget Amount',
      data: userData.map(item => item.budgetAmount),
      backgroundColor: 'rgba(255, 130, 157, 1)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }]
  };

  expenseChart = new Chart(ctx, {
    type: 'bar',
    data: barChartData,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    },
  });

  // Position the pie chart below the bar chart
  const pieCtx = document.getElementById('budgetPieChart').getContext('2d');
  const pieChartData = {
    labels: ['Total Expenses', 'Remaining Budget'],
    datasets: [{
      data: [totalExpenses(), remainingBudget()],
      backgroundColor: ['rgba(255, 130, 157, 1)', 'rgba(111, 205, 205, 1)'],
    }]
  };

  if (pieChart) {
    pieChart.destroy();
  }

  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: pieChartData,
    options: {
      legend: {
        display: false
      }
    }
  });

  pieChart.chart.canvas.parentNode.style.left = `${(ctx.canvas.width - pieChart.chart.width) / 2}px`;
  pieChart.chart.canvas.parentNode.style.top = `${ctx.canvas.height / 1.5}px`;
}

function totalExpenses() {
  return userData.reduce((acc, item) => acc + item.budgetAmount, 0);
}

function remainingBudget() {
  const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value);
  return monthlyBudget - totalExpenses();
}

function recommendBudgetAdjustment() {
  const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value);

  if (isNaN(monthlyBudget) || monthlyBudget <= 0) {
    alert('Please enter a valid monthly budget.');
    return;
  }

  const totalExpensesAmount = totalExpenses();

  if (totalExpensesAmount > monthlyBudget) {
    const overspendingAmount = totalExpensesAmount - monthlyBudget;
    alert(`You have exceeded your monthly budget by ₱${overspendingAmount.toFixed(2)}. Consider reducing expenses.`);
  } else {
    const remainingBudgetAmount = remainingBudget();
    alert(`You have ₱${remainingBudgetAmount.toFixed(2)} remaining in your monthly budget. Great job!`);
  }
}

function updateInsights() {
  const totalBudget = totalExpenses();
  const averageBudget = totalBudget / userData.length;

  const insightsElement = document.getElementById('insights');
  insightsElement.innerHTML = `Total Budget: ₱${totalBudget.toFixed(2)}<br>`;
  insightsElement.innerHTML += `Average Budget: ₱${averageBudget.toFixed(2)}<br><br>`;

  // Calculate and display potential savings for each category
  const categories = Array.from(new Set(userData.map(item => item.category))); // Get unique categories

  categories.forEach(category => {
    const categoryExpenses = userData.filter(item => item.category === category);
    const categoryTotal = categoryExpenses.reduce((acc, item) => acc + item.budgetAmount, 0);
    const categoryAverage = categoryTotal / categoryExpenses.length;

    // Calculate potential savings if the user reduces the category's average budget by 10%
    const reducedAverage = categoryAverage * 0.9;
    const potentialSavings = categoryTotal - (reducedAverage * categoryExpenses.length);

    insightsElement.innerHTML += `<strong>${category}:</strong><br>`;
    insightsElement.innerHTML += `Current Average: ₱${categoryAverage.toFixed(2)}<br>`;
    insightsElement.innerHTML += `Potential Savings (10% reduction): ₱${potentialSavings.toFixed(2)}<br><br>`;
  });

  // Display monthly budget information
  const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value);
  insightsElement.innerHTML += `Monthly Allotted Budget: ₱${monthlyBudget.toFixed(2)}<br>`;
}


function generateInsightsWithRules() {
  const categories = Array.from(new Set(userData.map(item => item.category))); // Get unique categories
  const insightsElement = document.getElementById('insights');
  insightsElement.innerHTML = '';

  categories.forEach(category => {
    const categoryExpenses = userData.filter(item => item.category === category);
    const categoryTotal = categoryExpenses.reduce((acc, item) => acc + item.budgetAmount, 0);
    const categoryAverage = categoryTotal / categoryExpenses.length;

    let reductionPercentage = 0.1; // Default reduction percentage

    // Apply specific rules for 'Food' and 'Utilities'
    if (category === 'Food' || category === 'Utilities') {
      reductionPercentage = 0.05; // Reduce less for 'Food' and 'Utilities'
    }

    // Calculate potential savings based on the reduction percentage
    const reducedAverage = categoryAverage * (1 - reductionPercentage);
    const potentialSavings = categoryTotal - (reducedAverage * categoryExpenses.length);

    insightsElement.innerHTML += `<strong>${category}:</strong><br>`;
    insightsElement.innerHTML += `Current Average: ₱${categoryAverage.toFixed(2)}<br>`;
    insightsElement.innerHTML += `Potential Savings (${(reductionPercentage * 100).toFixed(0)}% reduction): ₱${potentialSavings.toFixed(2)}<br><br>`;
  });

  // Display monthly budget information
  const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value);
  const totalBudget = userData.reduce((acc, item) => acc + item.budgetAmount, 0);
  const remainingBudgetAmount = Math.max(0, monthlyBudget - totalBudget); // Ensure remaining budget is non-negative
  insightsElement.innerHTML += `Monthly Allotted Budget: ₱${monthlyBudget.toFixed(2)}<br>`;
  insightsElement.innerHTML += `Total Expenses: ₱${totalBudget.toFixed(2)}<br>`;
  insightsElement.innerHTML += `Remaining Budget: ₱${remainingBudgetAmount.toFixed(2)}<br>`;
}