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
    ФРОНТ:
14. редирект на страницу с результатами (кнопка или ссылка "Скачать" и "Конвертировать другой архив")
15. добавить фронту лоска?
16. фронт на личный кабинет
17. перетащить архив в input
18. добавить функцию выбрать язык?
19. Добавить функцию изменения email updateUserEmail
20. убрать высоту лого в header
21. Галочка Запомнить меня при авторизации
22. На странице регистрации и авторизации поднять повыше форму (на уровень глаз)
23. Переписать на React
24. валидация пароля и email? Пароль должен удовлетворять требованиям (минимум 6 символов, заглавные и прописные, символы, без пробелов)
25. вынести в отдельную функцию fetchData
26. одна функция запроса на бэк getData
27. переписать register.js и login.js в одну функцию?
28. выровнять строки в таблице задач
29. если на любой странице html ошибка, выдать окно или блок с сообщением
30. добавить кнопку скачать
31. переписать конвертацию на один эндпойнт
32. сохранять файл под собственным именем
33. при авторизации переводить не на главную страницу, а в зависимости где находишься
34. удалить customError в связи с неиспользованием?
35. убрать пустой треугольник в alert-msg на странице login.html (регистрация тоже?)
36. редирект с любых страниц, кроме логин, регистрация, конвертация (титул), если пользователь не залогинен
37. доработать ссылку для подтверждения email ${origin}/user/verify-email (origin и эндпойнт)
38. переписать фронт на новые эндпойнты, добавить сменить пароль, почту, редактировать личные данные, убрать токены из local storage, переписать на кукис
39. добавить аватарку?
40. рефактор на одну функцию user.js и register.js
41. рефактор user.js - повторяются операции
42. добавить в регистрацию "повторите пароль"
43. заблокировать форму авторизации на время запроса?

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
