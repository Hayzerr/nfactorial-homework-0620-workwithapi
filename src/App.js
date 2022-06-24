import {useEffect, useState} from "react";
import "./App.css";
import axios from "axios";
import { TodoistApi } from '@doist/todoist-api-typescript';

const api = new TodoistApi('b81ab9d54dee10acd6dac0403078963d856ff9c7');
const BACKEND_URL = "http://10.65.134.130:3000";

/*
* Plan:
*   1. Define backend url
*   2. Get items and show them +
*   3. Toggle item done +
*   4. Handle item add +
*   5. Delete +
*   6. Filter
*
* */

function App() {  
  const [itemToAdd, setItemToAdd] = useState("");
  const [items, setItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [deletedItem, setdeletedItem] = useState([]);

  const showcompleted = () => {
      axios.get("https://api.todoist.com/sync/v8/completed/get_all", {
        headers: {
          Authorization: 'Bearer b81ab9d54dee10acd6dac0403078963d856ff9c7'
        }
      }).then((response) => {
          const NewItems = response.data;
          setItems(response.data.items);
        })
  };

  const unshowcompleted = () => {
    axios.get('https://api.todoist.com/rest/v1/tasks', {
        headers: {
          Authorization : "Bearer b81ab9d54dee10acd6dac0403078963d856ff9c7"
        },
    }).then((response) => {
        setItems(response.data);
    })
  };

  const handleChangeItem = (event) => {
    setItemToAdd(event.target.value);
  };
 
  const handleAddItem = () => {
    axios.post('https://api.todoist.com/rest/v1/tasks', {
        content:itemToAdd,
        done: false,
    },
    {
        headers: {
          Authorization: 'Bearer b81ab9d54dee10acd6dac0403078963d856ff9c7'
        }
    }).then((response) => {
        setItems([ ...items, response.data])
    }).catch((error) => {
      console.log(error);
    })
    setItemToAdd("");
  };


  const toggleItemDone = ({ id, done }) => {
      axios.post(`https://api.todoist.com/rest/v1/tasks/${id}/close`, {
          done: !done
      },
      {
        headers: {
          Authorization: 'Bearer b81ab9d54dee10acd6dac0403078963d856ff9c7',
        },
      }).then((response) => {
          setItems(items.map((item) => {
              if (item.id === id) {
                  return {
                      ...item,
                      done: !done
                  }
              }
              return item
          }))

      })
  };

  // N => map => N
    // N => filter => 0...N
  const handleItemDelete = (id) => {
      axios.delete(`https://api.todoist.com/rest/v1/tasks/${id}`, {
        headers:{
          Authorization: "Bearer b81ab9d54dee10acd6dac0403078963d856ff9c7"
        }
      }).then((response) => {
        setdeletedItem(response.data)
          console.log('Было:',items)
          const newItems = items.filter((item) => {
              return id !== item.id
          })
          console.log('Осталось:',newItems)
          setItems(newItems)
      })
  };

  // useEffect(() => {
  // console.log(searchValue)
  // axios.get(`${BACKEND_URL}/todos/?filter=${searchValue}`).then((response) => {
  //         setItems(response.data);
  //     })
  // }, [searchValue])

  useEffect(() => {
    axios.get('https://api.todoist.com/rest/v1/tasks', {
        headers: {
          Authorization : "Bearer b81ab9d54dee10acd6dac0403078963d856ff9c7"
        },
    }).then((response) => {
        setItems(response.data);
    })
  // }
  }, []);

  return (
    <div className="todo-app">
      {/* App-header */}
      <div className="app-header d-flex">
        <h1>Todo List</h1>
      </div>

      <div className="top-panel d-flex">
        {/* Search-panel */}
        <input
          type="text"
          className="form-control search-input"
          placeholder="type to search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </div>
      <button onClick={showcompleted} style = {{cursor: "pointer"}}>Completed</button>
      <button onClick={unshowcompleted} style = {{cursor: "pointer"}}>Not completed</button>
      {/* List-group */}
      <ul className="list-group todo-list">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} className="list-group-item">
              <span className={`todo-list-item${item.done ? " done" : ""}`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => toggleItemDone(item)}
                >
                  {item.content}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                  onClick={() => handleItemDelete(item.id)}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))
        ) : (
          <div>No todos🤤</div>
        )}
      </ul>

      {/* Add form */}
      <div className="item-add-form d-flex">
        <input
          value={itemToAdd}
          type="text"
          className="form-control"
          placeholder="What needs to be done"
          onChange={handleChangeItem}
        />
        <button className="btn btn-outline-secondary" onClick={handleAddItem}>
          Add item
        </button>
      </div>
    </div>
  );
}

export default App;
