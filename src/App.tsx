import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  USER_ID,
  getTodos,
  addTodo,
  deleteTodo,
  updateTodo,
} from './api/todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const newTodoField = useRef<HTMLInputElement>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (message: string) => {
    if (errorTimer.current) {
      clearTimeout(errorTimer.current);
    }

    setErrorMessage(message);
    errorTimer.current = setTimeout(() => {
      setErrorMessage('');
    }, 3000);
  };

  useEffect(() => {
    if (!USER_ID) {
      setIsLoading(false);

      return;
    }

    getTodos()
      .then(setTodos)
      .catch(() => showError('Unable to load todos'))
      .finally(() => setIsLoading(false));

    return () => {
      if (errorTimer.current) {
        clearTimeout(errorTimer.current);
      }
    };
  }, []);

  const setTodoLoading = (todoId: number, loading: boolean) => {
    setLoadingTodoIds(current =>
      loading
        ? current.includes(todoId)
          ? current
          : [...current, todoId]
        : current.filter(id => id !== todoId),
    );
  };

  const toggleTodo = async (todo: Todo) => {
    if (loadingTodoIds.includes(todo.id)) {
      return;
    }

    setTodoLoading(todo.id, true);

    try {
      const updatedTodo = await updateTodo(todo.id, {
        completed: !todo.completed,
      });

      setTodos(current =>
        current.map(item => (item.id === todo.id ? updatedTodo : item)),
      );
    } catch {
      showError('Unable to update a todo');
    } finally {
      setTodoLoading(todo.id, false);
    }
  };

  const removeTodo = async (todoId: number) => {
    if (loadingTodoIds.includes(todoId)) {
      return;
    }

    setTodoLoading(todoId, true);

    try {
      await deleteTodo(todoId);
      setTodos(current => current.filter(todo => todo.id !== todoId));
      newTodoField.current?.focus();
    } catch {
      showError('Unable to delete a todo');
    } finally {
      setTodoLoading(todoId, false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newTodoTitle.trim();

    if (!title) {
      showError('Title should not be empty');
      newTodoField.current?.focus();

      return;
    }

    if (isAdding) {
      return;
    }

    const temporaryId = -Date.now();
    const temporaryTodo: Todo = {
      id: temporaryId,
      userId: USER_ID!,
      title,
      completed: false,
    };

    setIsAdding(true);
    setErrorMessage('');
    setTodos(current => [...current, temporaryTodo]);

    try {
      const createdTodo = await addTodo(title);

      setTodos(current =>
        current.map(todo => (todo.id === temporaryId ? createdTodo : todo)),
      );
      setNewTodoTitle('');
      newTodoField.current?.focus();
    } catch {
      setTodos(current => current.filter(todo => todo.id !== temporaryId));
      showError('Unable to add a todo');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    if (!completedTodos.length) {
      return;
    }

    completedTodos.forEach(todo => setTodoLoading(todo.id, true));

    const results = await Promise.all(
      completedTodos.map(async todo => {
        try {
          await deleteTodo(todo.id);

          return { id: todo.id, success: true };
        } catch {
          return { id: todo.id, success: false };
        }
      }),
    );

    const deletedIds = results
      .filter(result => result.success)
      .map(result => result.id);

    if (results.some(result => !result.success)) {
      showError('Unable to delete a todo');
    }

    setTodos(current => current.filter(todo => !deletedIds.includes(todo.id)));

    completedTodos.forEach(todo => setTodoLoading(todo.id, false));
    newTodoField.current?.focus();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const activeTodosCount = todos.filter(
    todo => !todo.completed && todo.id > 0,
  ).length;

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      {isLoading && <div data-cy="Loader" className="loader" />}

      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {todos.length > 0 && (
            <button
              type="button"
              className={`todoapp__toggle-all ${
                todos.every(todo => todo.completed) ? 'active' : ''
              }`}
              data-cy="ToggleAllButton"
              onClick={async () => {
                const shouldComplete = !todos.every(todo => todo.completed);
                const targets = todos.filter(
                  todo => todo.completed !== shouldComplete,
                );

                targets.forEach(todo => setTodoLoading(todo.id, true));

                const results = await Promise.all(
                  targets.map(async todo => {
                    try {
                      const updated = await updateTodo(todo.id, {
                        completed: shouldComplete,
                      });

                      return { updated, success: true };
                    } catch {
                      return { updated: todo, success: false };
                    }
                  }),
                );

                setTodos(current =>
                  current.map(todo => {
                    const result = results.find(
                      item => item.updated.id === todo.id,
                    );

                    return result?.success ? result.updated : todo;
                  }),
                );

                if (results.some(result => !result.success)) {
                  showError('Unable to update a todo');
                }

                targets.forEach(todo => setTodoLoading(todo.id, false));
              }}
            />
          )}

          <form onSubmit={handleSubmit}>
            <input
              ref={newTodoField}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodoTitle}
              onChange={event => setNewTodoTitle(event.target.value)}
              disabled={isAdding}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <>
            <section className="todoapp__main" data-cy="TodoList">
              <ul className="todo__list">
                {filteredTodos.map(todo => {
                  const isTodoLoading =
                    loadingTodoIds.includes(todo.id) || todo.id < 0;

                  return (
                    <li
                      key={todo.id}
                      data-cy="Todo"
                      className={`todo ${todo.completed ? 'completed' : ''}`}
                    >
                      <div className="view">
                        <div
                          data-cy="TodoLoader"
                          className={isTodoLoading ? 'is-active' : 'is-hidden'}
                        />

                        <input
                          data-cy="TodoStatus"
                          type="checkbox"
                          className="todo__status"
                          checked={todo.completed}
                          disabled={isTodoLoading}
                          onChange={() => toggleTodo(todo)}
                        />

                        <label className="todo__title" data-cy="TodoTitle">
                          {todo.title}
                        </label>

                        <button
                          type="button"
                          className="todo__remove"
                          data-cy="TodoDelete"
                          disabled={isTodoLoading}
                          onClick={() => removeTodo(todo.id)}
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {activeTodosCount} items left
              </span>

              <nav className="filter" data-cy="Filter">
                <a
                  href="#/"
                  className={`filter__link ${
                    filter === 'all' ? 'selected' : ''
                  }`}
                  data-cy="FilterLinkAll"
                  onClick={event => {
                    event.preventDefault();
                    setFilter('all');
                  }}
                >
                  All
                </a>

                <a
                  href="#/active"
                  className={`filter__link ${
                    filter === 'active' ? 'selected' : ''
                  }`}
                  data-cy="FilterLinkActive"
                  onClick={event => {
                    event.preventDefault();
                    setFilter('active');
                  }}
                >
                  Active
                </a>

                <a
                  href="#/completed"
                  className={`filter__link ${
                    filter === 'completed' ? 'selected' : ''
                  }`}
                  data-cy="FilterLinkCompleted"
                  onClick={event => {
                    event.preventDefault();
                    setFilter('completed');
                  }}
                >
                  Completed
                </a>
              </nav>

              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                disabled={!todos.some(todo => todo.completed)}
                onClick={handleClearCompleted}
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>

      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${
          errorMessage ? '' : 'hidden'
        }`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />

        {errorMessage}
      </div>
    </div>
  );
};
