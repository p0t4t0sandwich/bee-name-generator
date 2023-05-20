# bee-name-generator

## Description

A bee-themed name generator for various uses.

## Discord Bot Usage

### Command List (markdown table)

| Command | Description | Parameters | Admin Only |
| --- | --- | --- | --- |
| `/bee_name get` | Get a bee name | None | false |
| `/bee_name upload` | Upload a bee name | `name`: string | true |
| `/bee_name suggestion submit` | Submit a bee name suggestion | `name`: string | false |
| `/bee_name suggestion get` | Get bee name suggestions | None | true |

## API Usage

I'm running this api myself here: <https://api.sperrer.ca/api/v1/bee-name-generator>

### Get a bee name

GET `/name`

JSON response:

```json
{
  "name": "beeatrice"
}
```

### Upload a bee name (Authentication Required)

URL encoded query parameters:

POST `/name/:name`

JSON body:

POST `/name`
  
  ```json
  {
    "name": "beeatrice"
  }
  ```

JSON response:

```json
{
  "name": "beeatrice"
}
```

### Submit a bee name

URL encoded query parameters:

POST `/suggestion/:name`

JSON body:

POST `/suggestion`
  
  ```json
  {
    "name": "beeatrice"
  }
  ```

JSON response:
  
  ```json
  {
    "name": "beeatrice"
  }
  ```

### Get bee name suggestions

URL encoded query parameters:

GET `/suggestion/:amount`

JSON body:

GET `/suggestion`
  
  ```json
  {
    "amount": 3
  }
  ```

JSON response:

```json
{
  "suggestions": [
    "beeatrice",
    "beeatrix",
    "beethany"
  ]
}
```

### Accept a bee name suggestion

URL encoded query parameters:

PUT `/suggestion/:name`

JSON body:

PUT `/suggestion`
  
  ```json
  {
    "name": "beeatrice"
  }
  ```

JSON response:
  
  ```json
  {
    "name": "beeatrice"
  }
  ```

### Reject a bee name suggestion

URL encoded query parameters:

DELETE `/suggestion/:name`

JSON body:

DELETE `/suggestion`
  
  ```json
  {
    "name": "beeatrice"
  }
  ```

JSON response:
  
  ```json
  {
    "name": "beeatrice"
  }
  ```
