добавить

БЭК:

1. сваггер
2. докер
3. логгер
4. тяжеловесные сайты через chunks, pipe
5. В конце исправить лимит запросов, дописать функцию ответа при превышении
6. обработка, если слишком долгий запрос, лимит
7. очистить cloudinary каждые 2 часа
8. удалить пользователя
9. morgan?
10. добавить пакеты безопасности. В частности, host-csrf? урок Using EJS In A Database Application, week15
11. Рефактор app.js - все роутеры в отдельный файл (Богдан 154, 155)
12. переписать почту с тестовой на желаемую GMAIL
13. добавить тесты puppeteer
14. создать запись админа, чтобы чистить базу данных?
15. двухфакторная аутентификация
16. выходить из учетки при изменении пароля или при изменениия email
    ФРОНТ:
17. редирект на страницу с результатами (кнопка или ссылка "Скачать" и "Конвертировать другой архив")
18. добавить фронту лоска?
19. фронт на личный кабинет
20. перетащить архив в input
21. добавить функцию выбрать язык?
22. Добавить функцию изменения email updateUserEmail
23. убрать высоту лого в header
24. Галочка Запомнить меня при авторизации
25. На странице регистрации и авторизации поднять повыше форму (на уровень глаз)
26. Переписать на React
27. валидация пароля и email? Пароль должен удовлетворять требованиям (минимум 6 символов, заглавные и прописные, символы, без пробелов)
28. вынести в отдельную функцию fetchData
29. одна функция запроса на бэк getData
30. переписать register.js и login.js в одну функцию?
31. выровнять строки в таблице задач
32. если на любой странице html ошибка, выдать окно или блок с сообщением
33. добавить кнопку скачать
34. переписать конвертацию на один эндпойнт
35. сохранять файл под собственным именем
36. при авторизации переводить не на главную страницу, а в зависимости где находишься
37. удалить customError в связи с неиспользованием?
38. убрать пустой треугольник в alert-msg на странице login.html (регистрация тоже?)
39. редирект с любых страниц, кроме логин, регистрация, конвертация (титул), если пользователь не залогинен
40. доработать ссылку для подтверждения email ${origin}/user/verify-email (origin и эндпойнт)
41. переписать фронт на новые эндпойнты, добавить сменить пароль, почту, редактировать личные данные, убрать токены из local storage, переписать на кукис
42. добавить аватарку?
43. рефактор на одну функцию user.js и register.js
44. рефактор user.js - повторяются операции
45. добавить в регистрацию "повторите пароль"
46. заблокировать форму авторизации на время запроса?
47. добавить забыл пароль
48. добавить Изменить пароль
49. При изменении пароля или почты отправить на старую почту письмо "Сделан запрос на изменения почты/пароля. Если это были не Вы, измените пароль"
50. Добавить обработку ссылок с истекшим сроком (verify-email, update-pasword, register)
51. Добавить для пользователя Изменить пароль в ЛК

Использую

1. бутстрап
2. html
3. express
4. puppeteer
5. adm-zip
6. https-status-codes
7. globe
8. blob
9. dotenv
10. express-fileupload
11. mongoDB
12. mongoose
13. helmet
14. cors
15. express-mongo-sanitize
16. express-rate-limit
17. express-async-errors
18. bcryptjs
19. jsonwebtoken
20. streamifier
21. cloudinary
22. cookie-parser
23. crypto
24. nodemailer

    Добавила:

25. Фронт
26. Регистрация/ авторизация / профиль пользователя
27. Обработка запросов (количество)
28. База данных - хранение истории в MongoDB, пользователей
29. Хранение самих файлов после конвертации в облаке
30. Изменить/ восстановить пароль, используя подтверждение почтой
