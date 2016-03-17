---
layout: post
title: "Symfony client for an API secured with LexikJWTAuthenticationBundle, user authenticator and user provider"
excerpt: "A simple example of a Symfony client (firewall, user authenticator, user provider, user model) configured to consumed an API protected with JWT token and LexikJWTAuthenticationBundle."
tags: [Symfony, jwt, token, LexikJWTAuthenticationBundle, client, api, authenticator, provider, authentication, auth]
image: symfony.png
comments: true
---

We can find on the internet many examples on how to implements a client consuming API authenticated with JWT.
But impossible to find one based on Symfony and how to configure firewall, user provider, user authenticator and a user model.
So let's see how to do it.

![Symfony](/images/posts/symfony.png)


# LexikJWTAuthenticationBundle Server side

To create an API secured with LexikJWTAuthenticationBundle and JWT,
just read and follow step by step [the documentation](https://github.com/lexik/LexikJWTAuthenticationBundle/blob/master/Resources/doc/index.md).
Everything should be fine as the doc is pretty good.

As we use custom roles for our users we need to expose them in the JWT token.
Indeed, we need to add them in our users on the client side.

## User roles in the JWT token

Just create a JWT listener:

{% highlight php startinline=true %}
<?php

namespace AdminBundle\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * Class JWTCreatedListener
 * @package AdminBundle\Security
 *
 * @DI\Service("project.listener.jwt_created")
 * @DI\Tag("kernel.event_listener", attributes = {
 *   "event" = "lexik_jwt_authentication.on_jwt_created", "method": "onJWTCreated"
 * })
 *
 */
class JWTCreatedListener
{
    /**
     * @param JWTCreatedEvent $event
     *
     * @return void
     */
    public function onJWTCreated(JWTCreatedEvent $event)
    {
        if (!($request = $event->getRequest())) {
            return;
        }

        $user = $event->getUser();
        $payload       = $event->getData();
        $payload['roles'] = $user->getRoles();

        $event->setData($payload);
    }
}

{% endhighlight %}

## Auth from query param

Sometimes you will need to generate forms on the server side, then serialize them into a json response, to be able to show them in the front.

The form action on submission will point to the server side, and it could be difficult to add the JWT token in the headers.

So I advise you to allow JWT authentication with query param.

{% highlight bash %}
security:
    firewalls:
        api:
            pattern:   ^/api
            provider: fos_userbundle # or something else
            stateless: true
            anonymous: true
            lexik_jwt:
                query_parameter:
                    enabled: true
                    name:    bearer # or something else
{% endhighlight %}

Of course when generating your forms views before exposing them to the API, do not forget to add the JWT token as a query string param.

{% highlight html %}

{% raw %}
<form
    method="POST"
    action="{{ url('your_route', {bearer: jwt_token}) }}"
    {{ form_enctype(form) }}
>
    ...
</form>
{% endraw %}
{% endhighlight %}

# Symfony JWT client (authenticator/provider)

As examples are better than words... let's configurations examples.

## Security

{% highlight bash %}
security:
    providers:
        token:
            id: project.token.user_provider

    firewalls:

        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false

        main:
            pattern: ^/
            provider: token
            anonymous: true
            simple_form:
                authenticator: project.token.authenticator
                check_path: login_check
                login_path: login
                use_referer: true
                failure_path: login
            logout:
                path: /logout
                target: login
            remember_me:
                secret:   '%secret%'
                lifetime: 86400
                path:     /

    access_control:
        - { path: ^/login, role: IS_AUTHENTICATED_ANONYMOUSLY }
        - { path: ^/editor, role: ROLE_EDITOR }
        - { path: ^/registration, role: IS_AUTHENTICATED_ANONYMOUSLY }
        - { path: ^/, role: IS_AUTHENTICATED_ANONYMOUSLY }
{% endhighlight %}

## Routing

{% highlight bash %}
login_check:
    pattern: /secured/login_check

logout:
    path: /logout

{% endhighlight %}

## User model

{% highlight php startinline=true %}
<?php

namespace AppBundle\Security;

use Symfony\Component\Security\Core\User\AdvancedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;

class ApiUser implements AdvancedUserInterface, \Serializable, EquatableInterface
{
    private $username;
    private $password;
    private $salt;
    private $roles;
    private $token;

    public function __construct($username, $password, $salt, array $roles, $token)
    {
        $this->username = $username;
        $this->password = $password;
        $this->salt = $salt;
        $this->roles = $roles;
        $this->token = $token;
    }

    public function getRoles()
    {
        return $this->roles;
    }

    public function getPassword()
    {
        return $this->password;
    }

    public function getSalt()
    {
        return $this->salt;
    }

    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @return mixed
     */
    public function getToken()
    {
        return $this->token;
    }

    public function eraseCredentials()
    {
    }

    public function isEqualTo(UserInterface $user)
    {
        if (!$user instanceof self) {
            return false;
        }

        if ($this->password !== $user->getPassword()) {
            return false;
        }

        if ($this->salt !== $user->getSalt()) {
            return false;
        }

        if ($this->username !== $user->getUsername()) {
            return false;
        }

        return true;
    }

    public function isAccountNonExpired()
    {
        return true;
    }

    public function isAccountNonLocked()
    {
        return true;
    }

    public function isCredentialsNonExpired()
    {
        return true;
    }

    public function isEnabled()
    {
        return true;
    }

    public function serialize()
    {
        return serialize([
            $this->token,
            $this->username,
            $this->password,
        ]);
    }

    public function unserialize($serialized)
    {
        list (
            $this->token,
            $this->username,
            $this->password,
            ) = unserialize($serialized);
    }


}

{% endhighlight %}

## Authenticator

{% highlight php startinline=true %}
<?php

namespace AppBundle\Security;

use AppBundle\Repository\RepositoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Http\Authentication\SimpleFormAuthenticatorInterface;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * Token Authenticator.
 *
 * @DI\Service("project.token.authenticator")
 */
class TokenAuthenticator implements SimpleFormAuthenticatorInterface
{
    /**
     * @var RepositoryInterface
     */
    protected $repository;

    /**
     * @var LoggerInterface
     */
    protected $logger;

    public function authenticateToken(TokenInterface $token, UserProviderInterface $userProvider, $providerKey)
    {
        try {
            $user = $token->getUser();
            $userProvider->getUsernameForApiKey($user->getToken());
        } catch (\Exception $e) {
            // CAUTION: this message will be returned to the client
            // (so don't put any un-trusted messages / error strings here)
            throw new CustomUserMessageAuthenticationException('Invalid username or password');
        }

        return new UsernamePasswordToken(
            $user,
            $user->getPassword(),
            $providerKey,
            $user->getRoles()
        );
    }

    public function supportsToken(TokenInterface $token, $providerKey)
    {
        return $token instanceof UsernamePasswordToken
            && $token->getProviderKey() === $providerKey;
    }

    /**
     * TokenAuthenticator constructor.
     *
     * @param RepositoryInterface $repository
     *
     * @DI\InjectParams({
     *   "repository" = @DI\Inject("project.repository.api"),
     * })
     */
    public function __construct(LoggerInterface $logger,  RepositoryInterface $repository)
    {
        $this->logger = $logger;
        $this->repository = $repository;
    }

    public function createToken(Request $request, $username, $password, $providerKey)
    {

        try {
            if (null === $username || null === $password) {
                throw new AuthenticationException('Username and password must be defined');
            }

            $data = [
                'form_params' => [
                    '_username' => $username,
                    '_password' => $password,
                ],
            ];

            try {
                // Call here your server to get a JWT Token from username and password.
                // I Use an API Repository based on Guzzle.
                $clientResponse = $this->repository->loginCheck($data);
                $token = json_decode($clientResponse->getBody(), true);

                if (!isset($token['token'])) {
                    throw new AuthenticationException('API No Auth Token returned');
                }
                $apiKey = $token['token'];

                if (!$apiKey) {
                    throw new AuthenticationException('API No Key found');
                }
                
                list($username, $roles) = $this->getUsernameForApiKey($apiKey);

                $user = new ApiUser($username, $password, '', $roles, $apiKey);

                return new UsernamePasswordToken(
                    $user,
                    $password,
                    $providerKey,
                    $roles
                );
            } catch (HttpException $ex) {
                switch ($ex->getStatusCode()) {
                    case Response::HTTP_UNAUTHORIZED:
                        throw new AuthenticationException('API Unauthorized: '. $ex->getMessage());
                    case Response::HTTP_FORBIDDEN:
                        throw new AuthenticationException('API Forbidden: '. $ex->getMessage());
                }
            }
        } catch (AuthenticationException $ex) {
            $this->logger->error($ex->getMessage());
            throw new CustomUserMessageAuthenticationException('Invalid username or password');
        }
    }
}

{% endhighlight %}

## Provider

{% highlight php startinline=true %}
<?php

namespace AppBundle\Security;

use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * Token User Provider.
 *
 * @DI\Service("project.token.user_provider")
 */
class TokenUserProvider implements UserProviderInterface
{
    const JWT_TOKEN_PARTS_COUNT = 3;
    const TOKEN_REFRESH_DELAY = 120;

    /**
     * TokenUserProvider constructor.
     *
     * @param LoggerInterface $logger
     *
     *
     * @DI\InjectParams({
     * })
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function getUsernameForApiKey($apiKey)
    {
        try {

            $tokenParts = explode('.', $apiKey);
            if (self::JWT_TOKEN_PARTS_COUNT !== count($tokenParts)) {
                throw new AuthenticationException('TOKEN Wrong Auth Token format');
            }

            $payload = json_decode(base64_decode($tokenParts[1]), true);
            if (!isset($payload['username'])) {
                throw new AuthenticationException('TOKEN No Username found in the Auth Token');
            }

            if (!isset($payload['exp'])) {
                throw new AuthenticationException('TOKEN No expiration timestamp found in the Auth Token');
            }

            $roles = isset($payload['roles']) ? $payload['roles'] : [];

            $exp = $payload['exp'];
            if ($exp + (int) self::TOKEN_REFRESH_DELAY <= time()) {
                throw new AuthenticationException('TOKEN Expired');
            }

            return [
                $payload['username'],
                $roles
            ];

        } catch (\Exception $ex) {
            $this->logger->error($ex->getMessage());
            throw new CustomUserMessageAuthenticationException('You have been disconnected, try to reconnect.');
        }
    }

    public function loadUserByUsername($username)
    {
        // NOT USED IN OUR CASE !!!
        return new ApiUser($username,  null, '', ['ROLE_USER'], '');
    }

    public function refreshUser(UserInterface $user)
    {

        if (!$user instanceof ApiUser) {
            throw new UnsupportedUserException(
                sprintf('Instances of "%s" are not supported.', get_class($user))
            );
        }

        list($username, $roles) = $this->getUsernameForApiKey($user->getToken());

        return new ApiUser($username,  null, '', $roles, $user->getToken());
    }

    public function supportsClass($class)
    {
        return 'AppBundle\Security\ApiUser' === $class;
    }
}

{% endhighlight %}

##  Authenticated API calls

Actually you can get your user as usual and get JWT token stored inside the user model.
Let's see an example of an "API repository"

{% highlight php startinline=true %}
<?php

namespace AppBundle\Repository\Api;

use AppBundle\Repository\RepositoryInterface;
use AppBundle\Security\ApiUser;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use JMS\DiExtraBundle\Annotation as DI;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Security;

/**
 * Class BaseRepository.
 *
 * @DI\Service("project.repository.api", abstract=true)
 */
abstract class BaseRepository implements RepositoryInterface
{

    /**
     * @var ClientRegistry
     */
    protected $client;

    /**
     * @var KernelInterface
     */
    protected $kernel;

    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @var TokenStorageInterface
     */
    protected $securityTokenStorage;

    /**
     * BaseRepository constructor.
     * @param KernelInterface $kernel
     * @param LoggerInterface $logger
     * @param ClientRegistry $client
     * @param TokenStorageInterface $securityTokenStorage
     *
     * @DI\InjectParams({
     *    "client" = @DI\Inject("project.registry.client"),
     *    "securityTokenStorage" = @DI\Inject("security.token_storage"),
     * })
     */
    public function __construct(KernelInterface $kernel, LoggerInterface $logger, ClientRegistry $client, TokenStorageInterface $securityTokenStorage)
    {
        $this->kernel = $kernel;
        $this->logger = $logger;
        $this->client = $client;
        $this->securityTokenStorage = $securityTokenStorage;
    }


    /**
     * @param $url
     * @param bool $public
     * @return mixed
     */
    protected function getData($url, $public = true)
    {
        try {
            $this->logger->debug('API call with Guzzle', ['url', $url]);
            $client = $this->client->get();

            $options = [];

            $token = $this->getUserToken();
            if (null !== $token) {
                $options = array_merge_recursive(
                    $options,  [
                    'headers' => [
                        'Authorization' => sprintf('Bearer %s', $token),
                    ],
                ]);

                $url .= sprintf('?bearer=%s', $token);
            }

            return $client->get($url, $options);
        } catch (RequestException $ex) {
            $response = $ex->getResponse();
            throw new HttpException($response->getStatusCode(), $ex->getMessage().'-'.$response->getReasonPhrase());
        }
    }

    protected function getUserToken()
    {
        $user = $this->securityTokenStorage->getToken()->getUser();
        if (is_object($user) && $user instanceof ApiUser) {
            return $user->getToken();
        }

        return null;
    }
}

{% endhighlight %}

## Conclusion

This configuration has been used as a POC. Feel free to change or optimize it.
Feedback appreciated too !

