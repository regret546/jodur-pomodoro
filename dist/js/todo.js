const todoInput = document.querySelector("#todoInput");
const addTodoBtn = document.querySelector("#addTodoBtn");
const todoList = document.querySelector("#todoList");
const emptyState = document.querySelector("#emptyState");

let todos = [];
let activeTodoIndex = null; // Track which todo has active timer
let draggedElement = null; // Track element being dragged
let draggedIndex = null; // Track index of dragged element

// Load todos from localStorage on page load
function loadTodos() {
  const storedTodos = localStorage.getItem("pomodoroTodos");
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
    // Migrate old todos to include new properties
    todos = todos.map((todo) => ({
      ...todo,
      completedAt: todo.completedAt || null,
    }));
    saveTodos(); // Save migrated todos
    renderTodos();
  } else {
    showEmptyState();
  }
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem("pomodoroTodos", JSON.stringify(todos));
}

// Show/hide empty state based on todos
function showEmptyState() {
  if (todos.length === 0) {
    emptyState.classList.remove("hidden");
    todoList.classList.add("hidden");
  } else {
    emptyState.classList.add("hidden");
    todoList.classList.remove("hidden");
  }
}

// Render all todos
function renderTodos() {
  todoList.innerHTML = "";
  
  if (todos.length === 0) {
    showEmptyState();
    return;
  }

  todoList.classList.remove("hidden");
  
  // Sync activeTodoIndex with global if available
  if (window.activeTodoIndex !== undefined) {
    activeTodoIndex = window.activeTodoIndex;
  }

  todos.forEach((todo, index) => {
    // Calculate timer state first
    const isActiveTodo = activeTodoIndex === index;
    // Check if timer is running - pause=true means timer is running, and it's the active todo
    const isTimerRunning = isActiveTodo && (window.pause === true || (typeof window.pause !== "undefined" && window.pause));
    
    const li = document.createElement("li");
    li.className =
      "flex flex-col gap-2 bg-brand-background p-2 sm:p-3 rounded-md transition-colors duration-300 group cursor-move";
    li.draggable = true;
    li.setAttribute("data-index", index);
    
    // Drag event handlers
    li.addEventListener("dragstart", (e) => {
      // Don't start drag if clicking on interactive elements
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT" || e.target.closest("button") || e.target.closest("input")) {
        e.preventDefault();
        return;
      }
      draggedElement = li;
      draggedIndex = index;
      li.classList.add("opacity-50");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/html", li.innerHTML);
    });
    
    li.addEventListener("dragend", (e) => {
      li.classList.remove("opacity-50");
      // Remove drag over styling from all items
      document.querySelectorAll("#todoList li").forEach(item => {
        item.classList.remove("border-brand-btn", "border-2");
      });
    });
    
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      
      if (li !== draggedElement) {
        const rect = li.getBoundingClientRect();
        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) < 0.5;
        
        if (next) {
          todoList.insertBefore(draggedElement, li);
        } else {
          todoList.insertBefore(draggedElement, li.nextSibling);
        }
      }
    });
    
    li.addEventListener("dragenter", (e) => {
      e.preventDefault();
      if (li !== draggedElement) {
        li.classList.add("border-brand-btn", "border-2", "bg-brand-btn/10");
      }
    });
    
    li.addEventListener("dragleave", (e) => {
      // Only remove styling if we're actually leaving the element
      if (!li.contains(e.relatedTarget)) {
        li.classList.remove("border-brand-btn", "border-2", "bg-brand-btn/10");
      }
    });
    
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      li.classList.remove("border-brand-btn", "border-2", "bg-brand-btn/10");
      
      if (draggedElement && draggedElement !== li && draggedIndex !== null) {
        // Get the new index based on position in DOM
        const allItems = Array.from(todoList.children);
        const newIndex = allItems.indexOf(draggedElement);
        
        if (newIndex !== draggedIndex && newIndex !== -1) {
          // Reorder todos array
          const draggedTodo = todos[draggedIndex];
          todos.splice(draggedIndex, 1);
          todos.splice(newIndex, 0, draggedTodo);
          
          // Update activeTodoIndex if needed
          if (activeTodoIndex === draggedIndex) {
            activeTodoIndex = newIndex;
            window.activeTodoIndex = newIndex;
          } else if (draggedIndex < activeTodoIndex && newIndex >= activeTodoIndex) {
            activeTodoIndex = activeTodoIndex - 1;
            window.activeTodoIndex = activeTodoIndex - 1;
          } else if (draggedIndex > activeTodoIndex && newIndex <= activeTodoIndex) {
            activeTodoIndex = activeTodoIndex + 1;
            window.activeTodoIndex = activeTodoIndex + 1;
          }
          
          saveTodos();
          renderTodos();
        }
      }
      
      // Reset drag state
      draggedElement = null;
      draggedIndex = null;
    });
    
    const topRow = document.createElement("div");
    topRow.className = "flex items-center gap-2 sm:gap-3";
    
    // Drag handle icon
    const dragHandle = document.createElement("div");
    dragHandle.className = "cursor-move text-brand-text/40 hover:text-brand-text/60 transition-colors flex-shrink-0";
    dragHandle.innerHTML = '<i class="fa-solid fa-grip-vertical text-xs sm:text-sm"></i>';
    dragHandle.setAttribute("aria-label", "Drag to reorder");
    
    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.className =
      "w-5 h-5 sm:w-6 sm:h-6 cursor-pointer accent-brand-btn flex-shrink-0";
    checkbox.disabled = isTimerRunning; // Disable when timer is running
    checkbox.addEventListener("change", () => toggleTodo(index));

    // Todo text container
    const textContainer = document.createElement("div");
    textContainer.className = "flex-1 flex flex-col gap-1";
    
    // Todo text
    const text = document.createElement("span");
    text.className = `text-sm sm:text-base ${
      todo.completed
        ? "line-through text-brand-text/50"
        : "text-brand-text"
    }`;
    text.textContent = todo.text;
    text.addEventListener("dblclick", () => editTodo(index, text));

    // Completion timestamp
    const timestamp = document.createElement("span");
    timestamp.className = "text-xs text-brand-text/40";
    if (todo.completed && todo.completedAt) {
      const date = new Date(todo.completedAt);
      timestamp.textContent = `Completed: ${formatTimestamp(date)}`;
    } else {
      timestamp.textContent = "";
    }

    textContainer.appendChild(text);
    textContainer.appendChild(timestamp);

    // Pomodoro button to start timer (always work mode for todos)
    const pomoBtn = document.createElement("button");
    pomoBtn.className =
      "opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 bg-brand-btn/70 border-t-2 border-r-2 border-l-2 border-b-5 border-brand-text text-brand-text font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg hover:bg-brand-btn/40 active:bg-brand-btn/50 transition-colors duration-300 touch-manipulation flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    pomoBtn.disabled = todo.completed || isTimerRunning;
    pomoBtn.innerHTML = isTimerRunning 
      ? '<i class="fa-solid fa-pause text-xs sm:text-sm"></i>'
      : '<i class="fa-solid fa-play text-xs sm:text-sm"></i>';
    pomoBtn.setAttribute("aria-label", isTimerRunning ? "Timer running for this task" : "Start work pomodoro for this task");
    pomoBtn.setAttribute("data-todo-index", index);
    pomoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!todo.completed && !isTimerRunning) {
        selectTodoPomodoro(index);
      }
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className =
      "opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500 hover:text-red-600 active:text-red-700 touch-manipulation min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    deleteBtn.disabled = isTimerRunning; // Disable when timer is running
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash text-sm sm:text-base"></i>';
    deleteBtn.setAttribute("aria-label", "Delete todo");
    deleteBtn.addEventListener("click", () => {
      if (!isTimerRunning) {
        deleteTodo(index);
      }
    });

    topRow.appendChild(dragHandle);
    topRow.appendChild(checkbox);
    topRow.appendChild(textContainer);
    topRow.appendChild(pomoBtn);
    topRow.appendChild(deleteBtn);
    
    li.appendChild(topRow);
    todoList.appendChild(li);
  });
}

// Add new todo
function addTodo() {
  const text = todoInput.value.trim();
  if (text === "") {
    return;
  }

  todos.push({
    text: text,
    completed: false,
    id: Date.now(),
    completedAt: null,
  });

  todoInput.value = "";
  saveTodos();
  renderTodos();
}

// Toggle todo completion
function toggleTodo(index) {
  todos[index].completed = !todos[index].completed;
  if (todos[index].completed && !todos[index].completedAt) {
    todos[index].completedAt = Date.now();
  } else if (!todos[index].completed) {
    todos[index].completedAt = null;
  }
  saveTodos();
  renderTodos();
}

// Delete todo
function deleteTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

// Edit todo (double-click to edit)
function editTodo(index, textElement) {
  const currentText = todos[index].text;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.className =
    "flex-1 bg-brand-background text-brand-text border-2 border-brand-btn rounded-md px-2 py-1 text-sm sm:text-base focus:outline-none";
  
  const li = textElement.parentElement;
  const oldText = textElement.textContent;
  
  textElement.replaceWith(input);
  input.focus();
  input.select();

  const saveEdit = () => {
    const newText = input.value.trim();
    if (newText === "") {
      input.replaceWith(textElement);
      return;
    }
    
    todos[index].text = newText;
    saveTodos();
    renderTodos();
  };

  input.addEventListener("blur", saveEdit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      input.replaceWith(textElement);
    }
  });
}

// Event listeners
addTodoBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// Select pomodoro for a todo (sets main timer to work mode and starts it)
function selectTodoPomodoro(index) {
  const todo = todos[index];
  if (!todo || todo.completed) {
    return;
  }

  // Set this todo as active
  activeTodoIndex = index;
  window.activeTodoIndex = index; // Expose globally for pomodoro.js

  // Function to start the pomodoro timer
  const startPomodoroTimer = () => {
    // Check if renderTimer is available
    const renderTimerFn = window.renderTimer;
    
    if (!renderTimerFn) {
      return false;
    }

    try {
      // Set the timer to work mode (this resets pause to false and sets timeLeft)
      renderTimerFn("work");
      
      // Small delay to ensure renderTimer has finished setting everything up
      setTimeout(() => {
        // Click the start button to start the timer
        const startButton = document.querySelector("#startButton");
        if (startButton) {
          const icon = startButton.querySelector("i");
          // Only click if timer is not already running (icon shows play)
          if (icon && icon.classList.contains("fa-play")) {
            startButton.click();
            // Update todo buttons after starting
            updateTodoButtons();
          }
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error("Error starting pomodoro timer:", error);
      return false;
    }
  };

  // Try immediately
  if (!startPomodoroTimer()) {
    // If not available, wait and retry multiple times
    let attempts = 0;
    const maxAttempts = 20;
    const retryInterval = setInterval(() => {
      attempts++;
      if (startPomodoroTimer()) {
        clearInterval(retryInterval);
      } else if (attempts >= maxAttempts) {
        clearInterval(retryInterval);
        console.error("renderTimer not available after multiple attempts. Make sure pomodoro.js is loaded.");
      }
    }, 100);
  }
}

// Update todo play button states based on timer status
function updateTodoButtons() {
  const todoButtons = document.querySelectorAll('[data-todo-index]');
  // pause=true means timer is running
  const isTimerRunning = window.pause === true || (typeof window.pause !== "undefined" && window.pause);
  
  // Sync activeTodoIndex
  if (window.activeTodoIndex !== undefined) {
    activeTodoIndex = window.activeTodoIndex;
  }
  
  todoButtons.forEach((btn) => {
    const todoIdx = parseInt(btn.getAttribute("data-todo-index"));
    const isActiveTodo = activeTodoIndex === todoIdx;
    const todo = todos[todoIdx];
    
    if (todo && !todo.completed) {
      // Disable only if this is the active todo AND timer is running
      btn.disabled = isTimerRunning && isActiveTodo;
      
      if (isTimerRunning && isActiveTodo) {
        btn.innerHTML = '<i class="fa-solid fa-pause text-xs sm:text-sm"></i>';
        btn.setAttribute("aria-label", "Timer running for this task");
      } else {
        btn.innerHTML = '<i class="fa-solid fa-play text-xs sm:text-sm"></i>';
        btn.setAttribute("aria-label", "Start work pomodoro for this task");
      }
    }
  });
  
  // Also update checkboxes and delete buttons for the active todo
  todos.forEach((todo, index) => {
    const isActiveTodo = activeTodoIndex === index;
    const shouldDisable = isTimerRunning && isActiveTodo;
    
    // Find the checkbox for this todo
    const todoItem = todoList.children[index];
    if (todoItem) {
      const checkbox = todoItem.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.disabled = shouldDisable;
      }
      
      // Find the delete button for this todo
      const deleteBtn = todoItem.querySelector('button[aria-label="Delete todo"]');
      if (deleteBtn) {
        deleteBtn.disabled = shouldDisable;
      }
    }
  });
}

// Expose updateTodoButtons globally for pomodoro.js
window.updateTodoButtons = updateTodoButtons;

// Helper function to get element after which to insert dragged element
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Format timestamp for display
function formatTimestamp(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    // Show date if older than a week
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

// Load todos when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadTodos();
  
  // Ensure renderTimer is available after a short delay
  setTimeout(() => {
    if (typeof window.renderTimer !== "function" && typeof renderTimer === "function") {
      window.renderTimer = renderTimer;
    }
  }, 500);
});

