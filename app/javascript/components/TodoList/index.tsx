import React, { useEffect, useState, useRef } from "react";
import { Container, ListGroup, Form } from "react-bootstrap";
import { ResetButton } from "./uiComponent";
import axios from "axios";
import moment from "moment";
import { isDebuggerStatement } from "typescript";

type TodoItem = {
  id: number;
  title: string;
  checked: boolean;
  deadline: date;
};

type Props = {
  todoItems: TodoItem[];
};

const TodoList: React.FC<Props> = ({ todoItems }) => {

  const [todoList, setTodoList] = useState(todoItems.map(todo => ({...todo, deadline: new Date(todo.deadline) })));
  const timerId = useRef(null)

  useEffect(()=>{
    const currentDate = new Date()
    const nearestDeadlineTodo = todoList.sort((t1, t2) => t1.deadline > t2.deadline  ? 1 : -1).find(todo => todo.deadline > currentDate)

    if(nearestDeadlineTodo){
      timerId.current = setTimeout(() => {
        alert(`Reminder: ${new Date(nearestDeadlineTodo.deadline)} for todo ${nearestDeadlineTodo.title}`)
        setTodoList([...todoList])
      }, nearestDeadlineTodo.deadline.getTime() - currentDate.getTime())

    }
  
    return () => clearTimeout(timerId.current);
  },[todoList])
  
  useEffect(() => {
    const token = document.querySelector(
      "[name=csrf-token]"
    ) as HTMLMetaElement;
    axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
  }, []);

  const checkBoxOnCheck = (
    e: React.ChangeEvent<HTMLInputElement>,
    todoItemId: number
  ): void => {
    axios.post("/todo", {
      id: todoItemId,
      checked: e.target.checked,
    }).then(res => {
      setTodoList((prevList): TodoItem[] => {
       return prevList.map(todo => {
        if(todo.id == todoItemId)
          todo.checked = !e.target.checked;
        return {...todo};
       })
      })
    })
  };

  const clearAllTodo = (): void => {
    setTodoList((prev): TodoItem[] => prev.map((t) => ({ ...t, checked: false})))
  };

  const resetButtonOnClick = (): void => {
    axios.post("/reset").then((res) => clearAllTodo());
  };

  return (
    <Container>
      <h3>2022 Wish List</h3>
      <ListGroup>
        {todoList.map((todo) => (
          <ListGroup.Item key={todo.id}>
            <Form.Check
              type="checkbox"
              label={todo.title}
              checked={todo.checked}
              onChange={(e) => checkBoxOnCheck(e, todo.id)}
              />
              <p>{moment(todo.deadline).format('llll')}</p>
          </ListGroup.Item>
        ))}
        <ResetButton onClick={resetButtonOnClick}>Reset</ResetButton>
      </ListGroup>
    </Container>
  );
};

export default TodoList;
