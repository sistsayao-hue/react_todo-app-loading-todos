import React, { useEffect, useRef, useState } from 'react';
<<<<<<< HEAD
import classNames from 'classnames';

import { UserWarning } from './UserWarning';

=======
import { UserWarning } from './UserWarning';
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)
import {
  USER_ID,
  getTodos,
  addTodo,
<<<<<<< HEAD
  updateTodo,
  deleteTodo,
} from './api/todos';

import { Todo } from './api/Todo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [errorMessage, setErrorMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const [newTodoTitle, setNewTodoTitle] = useState('');

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

  const [editingTitle, setEditingTitle] = useState('');

  const newTodoField = useRef<HTMLInputElement>(null);

  const showError = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
=======
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
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)
      setErrorMessage('');
    }, 3000);
  };

<<<<<<< HEAD
  const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);

  const activeTodos = todos.filter(todo => !todo.completed);

  const completedTodos = todos.filter(todo => todo.completed);

  const filteredTodos = todos.filter(todo => {
    switch (filter) {
      case 'active':
        return !todo.completed;

      case 'completed':
        return todo.completed;

      default:
        return true;
    }
  });

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        showError('Unable to load todos');
      })
      .finally(() => {
        setIsLoading(false);

        setTimeout(() => {
          newTodoField.current?.focus();
        }, 0);
      });
  }, []);

  useEffect(() => {
    const updateFilter = () => {
      switch (window.location.hash) {
        case '#/active':
          setFilter('active');
          break;

        case '#/completed':
          setFilter('completed');
          break;

        default:
          setFilter('all');
      }
    };

    updateFilter();

    window.addEventListener('hashchange', updateFilter);

    return () => {
      window.removeEventListener('hashchange', updateFilter);
    };
  }, []);

  const hideError = () => {
    setErrorMessage('');
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditingTitle('');
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
  };

  // A Parte 2 começa aqui com:
  // const handleAddTodo = async (...)
  const handleAddTodo = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    const title = newTodoTitle.trim();

    if (!title) {
      showError('Title should not be empty');
      newTodoField.current?.focus();

      return;
    }

    const temporaryTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title,
      completed: false,
    };

    setTempTodo(temporaryTodo);
    setLoadingIds([0]);

    try {
      const newTodo = await addTodo(title);

      setTodos(current => [...current, newTodo]);
      setNewTodoTitle('');
    } catch {
      showError('Unable to add a todo');
    } finally {
      setTempTodo(null);
      setLoadingIds([]);

      setTimeout(() => {
        newTodoField.current?.focus();
      }, 0);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    setLoadingIds(ids => [...ids, todo.id]);
=======
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
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)

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
<<<<<<< HEAD
      setLoadingIds(ids => ids.filter(id => id !== todo.id));
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    setLoadingIds(ids => [...ids, todoId]);

    try {
      await deleteTodo(todoId);

      setTodos(current => current.filter(todo => todo.id !== todoId));
    } catch {
      showError('Unable to delete a todo');
    } finally {
      setLoadingIds(ids => ids.filter(id => id !== todoId));

      setTimeout(() => {
        newTodoField.current?.focus();
      }, 0);
    }
  };

  const handleToggleAll = async () => {
    const newStatus = !allCompleted;

    const changedTodos = todos.filter(todo => todo.completed !== newStatus);

    setLoadingIds(changedTodos.map(todo => todo.id));

    try {
      const updatedTodos = await Promise.all(
        changedTodos.map(todo =>
          updateTodo(todo.id, {
            completed: newStatus,
          }),
        ),
      );

      setTodos(current =>
        current.map(todo => {
          const updated = updatedTodos.find(item => item.id === todo.id);

          return updated || todo;
        }),
      );
    } catch {
      showError('Unable to update a todo');
    } finally {
      setLoadingIds([]);
=======
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
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)
    }
  };

  const handleClearCompleted = async () => {
<<<<<<< HEAD
    const completed = todos.filter(todo => todo.completed);

    setLoadingIds(completed.map(todo => todo.id));

    try {
      const results = await Promise.allSettled(
        completed.map(todo => deleteTodo(todo.id)),
      );

      setTodos(current =>
        current.filter(todo => {
          if (!todo.completed) {
            return true;
          }

          const index = completed.findIndex(item => item.id === todo.id);

          return results[index].status === 'rejected';
        }),
      );

      if (results.some(result => result.status === 'rejected')) {
        showError('Unable to delete a todo');
      }
    } finally {
      setLoadingIds([]);

      setTimeout(() => {
        newTodoField.current?.focus();
      }, 0);
    }
  };

  const handleUpdateTitle = async (todo: Todo) => {
    const trimmedTitle = editingTitle.trim();

    if (trimmedTitle === todo.title) {
      cancelEditing();

      return;
    }

    if (!trimmedTitle) {
      await handleDeleteTodo(todo.id);
      cancelEditing();

      return;
    }

    setLoadingIds(ids => [...ids, todo.id]);

    try {
      const updatedTodo = await updateTodo(todo.id, {
        title: trimmedTitle,
      });

      setTodos(current =>
        current.map(item => (item.id === todo.id ? updatedTodo : item)),
      );

      cancelEditing();
    } catch {
      showError('Unable to update a todo');
    } finally {
      setLoadingIds(ids => ids.filter(id => id !== todo.id));
    }
  };

  const handleEditKeyUp = (
    event: React.KeyboardEvent<HTMLInputElement>,
    todo: Todo,
  ) => {
    if (event.key === 'Enter') {
      handleUpdateTitle(todo);

      return;
    }

    if (event.key === 'Escape') {
      cancelEditing();
    }
  };
=======
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
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      {isLoading && <div data-cy="Loader" className="loader" />}

      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
<<<<<<< HEAD
          {!isLoading && todos.length > 0 && (
            <button
              type="button"
              data-cy="ToggleAllButton"
              className={classNames('todoapp__toggle-all', {
                active: allCompleted,
              })}
              onClick={handleToggleAll}
            />
          )}

          <form>
=======
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
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)
            <input
              ref={newTodoField}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodoTitle}
              onChange={event => setNewTodoTitle(event.target.value)}
<<<<<<< HEAD
              onKeyDown={handleAddTodo}
              disabled={tempTodo !== null}
              autoFocus
=======
              disabled={isAdding}
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)
            />
          </form>
        </header>

<<<<<<< HEAD
        {isLoading && (
          <div className="modal overlay is-active" data-cy="TodoLoader">
            <div className="loader" />
          </div>
        )}

        {!isLoading && todos.length > 0 && (
          <section className="todoapp__main" data-cy="TodoList">
            <ul className="todo__list">
              {[...filteredTodos, ...(tempTodo ? [tempTodo] : [])].map(todo => (
                <li
                  key={todo.id}
                  data-cy="Todo"
                  className={classNames('todo', {
                    completed: todo.completed,
                  })}
                >
                  <div className="view">
                    <input
                      type="checkbox"
                      className="todo__status"
                      data-cy="TodoStatus"
                      checked={todo.completed}
                      disabled={todo.id === 0}
                      onChange={() => toggleTodo(todo)}
                    />

                    {editingTodoId === todo.id ? (
                      <input
                        data-cy="TodoTitleField"
                        type="text"
                        className="todo__title-field"
                        value={editingTitle}
                        onChange={event => setEditingTitle(event.target.value)}
                        onBlur={() => handleUpdateTitle(todo)}
                        onKeyUp={event => handleEditKeyUp(event, todo)}
                        autoFocus
                      />
                    ) : (
                      <>
                        <label
                          data-cy="TodoTitle"
                          onDoubleClick={() => startEditing(todo)}
                        >
                          {todo.title}
                        </label>

                        <button
                          type="button"
                          className="todo__remove"
                          data-cy="TodoDelete"
                          onClick={() => handleDeleteTodo(todo.id)}
                        >
                          ×
                        </button>
                      </>
                    )}

                    <div
                      data-cy="TodoLoader"
                      className={classNames('modal overlay', {
                        'is-active': loadingIds.includes(todo.id),
                      })}
                    >
                      <div className="loader" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!isLoading && todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
             {activeTodos.length}{' '}


       {`${activeTodos.length} ${
               activeTodos.length === 1 ? 'item' : 'items'
             } left`}
              

            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                data-cy="FilterLinkAll"
                className={classNames('filter__link', {
                  selected: filter === 'all',
                })}
              >
                All
              </a>

              <a
                href="#/active"
                data-cy="FilterLinkActive"
                className={classNames('filter__link', {
                  selected: filter === 'active',
                })}
              >
                Active
              </a>

              <a
                href="#/completed"
                data-cy="FilterLinkCompleted"
                className={classNames('filter__link', {
                  selected: filter === 'completed',
                })}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              onClick={handleClearCompleted}
              disabled={completedTodos.length === 0}
            >
              Clear completed
            </button>
          </footer>
=======
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
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)
        )}
      </div>

      <div
        data-cy="ErrorNotification"
<<<<<<< HEAD
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button
          type="button"
          className="delete"
          data-cy="HideErrorButton"
          onClick={hideError}
=======
        className={`notification is-danger is-light has-text-weight-normal ${
          errorMessage ? '' : 'hidden'
        }`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
>>>>>>> 6c90e59 (Fix loading indicator and todo text wrapping)
        />

        {errorMessage}
      </div>
    </div>
  );
};

