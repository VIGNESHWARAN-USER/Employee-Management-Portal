package com.ems.backend.Models;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payslips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payslip_id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private Employee user;

    @ManyToOne
    @JoinColumn(name = "salary_id", referencedColumnName = "id")
    private Salaries salary;

    @Column(length = 20)
    private String month;

    @Override
    public String toString() {
        return "Payslip{" +
                "id=" + id +
                ", user=" + user +
                ", salary=" + salary +
                ", month='" + month + '\'' +
                ", year=" + year +
                ", generatedOn=" + generatedOn +
                '}';
    }

    private Integer year;

    @Column(name = "generated_on", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime generatedOn;

    @PrePersist
    public void prePersist() {
        this.generatedOn = LocalDateTime.now();
    }
}
