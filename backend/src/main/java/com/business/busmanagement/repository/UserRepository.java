package com.business.busmanagement.repository;

/* ============================================================
 * findByUsernameWithRole: EAGER LOAD role (tránh LazyInitException)
 * ============================================================ */

import com.business.busmanagement.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    /**
     * Tìm user kèm role đã fetch EAGER.
     * Dùng TRONG JwtAuthenticationFilter vì filter chạy NGOÀI transaction context,
     * nên User.role (lazy-loaded) sẽ gây LazyInitializationException nếu không join fetch.
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.username = :username")
    Optional<User> findByUsernameWithRole(@Param("username") String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByRoleId(Long roleId);

    /**
     * PERFORMANCE (fix Dashboard): đếm user theo status ngoại trừ INACTIVE.
     * 1 query thay vì findAll + filter trong Java.
     */
    long countByStatusNot(User.UserStatus status);

    /**
     * PERFORMANCE (fix Dashboard): gom user theo role name trong 1 GROUP BY.
     * Trả về [roleName, count] — 1 query thay cho O(N×M) loop trên users + roles.
     */
    @Query("""
            SELECT r.name, COUNT(u)
            FROM User u
            JOIN u.role r
            WHERE u.status <> 'INACTIVE'
            GROUP BY r.name
            """)
    java.util.List<Object[]> countActiveUsersGroupedByRole();
}